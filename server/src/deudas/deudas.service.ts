import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDeudaDto } from './dto/create-deuda.dto.js';
import { UpdateDeudaDto } from './dto/update-deuda.dto.js';
import { Deuda, Prisma } from '../generated/prisma/client.js';
import { importeMensual } from '../recurrentes/importe-mensual.js';

@Injectable()
export class DeudasService {
  private readonly prisma: PrismaService;

  // Pendiente = montoTotal − suma de los movimientos ligados a la deuda.
  // Todo se calcula aquí con Decimal: el front no hace cuentas.
  private async addPendiente(deuda: Deuda) {
    const pagos = await this.prisma.movimiento.aggregate({
      where: { deudaId: deuda.deudaId },
      _sum: { monto: true },
    });

    const total = new Prisma.Decimal(deuda.montoTotal);
    const pagado = pagos._sum.monto ?? new Prisma.Decimal(0);
    // Nunca negativo (un pago de más anterior a la regla cuenta como saldada)
    const pendiente = Prisma.Decimal.max(0, total.minus(pagado));
    const porcentaje = total.isZero()
      ? new Prisma.Decimal(0)
      : Prisma.Decimal.min(100, pagado.div(total).times(100)).toDecimalPlaces(
          0,
        );

    return {
      ...deuda,
      pagado,
      pendiente,
      porcentaje,
      saldada: pendiente.isZero(),
    };
  }

  // Totales de la pestaña Deudas: lo pendiente, lo pagado y las cuotas al mes
  async resumen() {
    const deudas = await this.findAll();

    let total = new Prisma.Decimal(0);
    let pagado = new Prisma.Decimal(0);
    let pendiente = new Prisma.Decimal(0);
    for (const deuda of deudas) {
      total = total.plus(deuda.montoTotal);
      pagado = pagado.plus(deuda.pagado);
      pendiente = pendiente.plus(deuda.pendiente);
    }

    // Cuotas = recurrentes activos enlazados a una deuda
    const cuotas = await this.prisma.recurrente.findMany({
      where: { activo: true, deudaId: { not: null } },
    });
    const cuotasMes = cuotas.reduce(
      (suma, r) => suma.plus(importeMensual(r)),
      new Prisma.Decimal(0),
    );

    const porcentaje = total.isZero()
      ? new Prisma.Decimal(0)
      : Prisma.Decimal.min(100, pagado.div(total).times(100));

    return {
      numDeudas: deudas.length,
      total: total.toFixed(2),
      pagado: pagado.toFixed(2),
      pendiente: pendiente.toFixed(2),
      porcentaje: porcentaje.toFixed(0),
      cuotasMes: cuotasMes.toFixed(2),
    };
  }

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  //Crear deuda
  async create(data: CreateDeudaDto) {
    const deuda = await this.prisma.deuda.create({ data });
    return await this.addPendiente(deuda);
  }

  //Obtener todas las deudas
  async findAll() {
    const deudas = await this.prisma.deuda.findMany({
      orderBy: { deudaId: 'desc' },
    });
    return await Promise.all(deudas.map((deuda) => this.addPendiente(deuda)));
  }

  //Obtener una deuda
  async findOne(id: number) {
    const deuda = await this.prisma.deuda.findUnique({
      where: { deudaId: id },
    });
    if (!deuda) {
      throw new NotFoundException(`La deuda con ID ${id} no fue encontrada`);
    }
    return await this.addPendiente(deuda);
  }

  //Actualizar deuda
  async update(id: number, data: UpdateDeudaDto) {
    try {
      const deuda = await this.prisma.deuda.update({
        where: { deudaId: id },
        data,
      });
      return await this.addPendiente(deuda);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`La deuda con ID ${id} no fue encontrada`);
      }
      throw error;
    }
  }

  //Borrar deuda
  async delete(id: number) {
    try {
      return await this.prisma.deuda.delete({
        where: { deudaId: id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`La deuda con ID ${id} no fue encontrada`);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          `No se puede eliminar la deuda porque tiene pagos o recurrentes asociados`,
        );
      }
      throw error;
    }
  }
}
