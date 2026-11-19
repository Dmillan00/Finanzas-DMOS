import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDeudaDto } from './dto/create-deuda.dto.js';
import { UpdateDeudaDto } from './dto/update-deuda.dto.js';
import { Deuda, Prisma } from '../generated/prisma/client.js';

@Injectable()
export class DeudasService {
  private readonly prisma: PrismaService;

  // Pendiente = montoTotal − suma de los movimientos ligados a la deuda
  private async addPendiente(deuda: Deuda) {
    const pagos = await this.prisma.movimiento.aggregate({
      where: { deudaId: deuda.deudaId },
      _sum: { monto: true },
    });

    const pagado = pagos._sum.monto ?? new Prisma.Decimal(0);
    const pendiente = new Prisma.Decimal(deuda.montoTotal).minus(pagado);

    return { ...deuda, pagado, pendiente };
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
