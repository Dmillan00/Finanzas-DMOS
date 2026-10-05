import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCuentaDto } from './dto/create-cuenta.dto.js';
import { UpdateCuentaDto } from './dto/update-cuenta.dto.js';
import { Prisma, Cuenta } from '../generated/prisma/client.js';

@Injectable()
export class CuentasService {
  private readonly prisma: PrismaService;

  private async addSaldo(cuenta: Cuenta) {
    const cuentaId = cuenta.cuentaId;

    const ingresos = this.prisma.movimiento.aggregate({
      where: { cuentaBaseId: cuentaId, tipo: 'INGRESO' },
      _sum: {
        monto: true,
      },
    });

    const gastos = this.prisma.movimiento.aggregate({
      where: { cuentaBaseId: cuentaId, tipo: 'GASTO' },
      _sum: {
        monto: true,
      },
    });

    const transferenciaSaliente = this.prisma.movimiento.aggregate({
      where: { cuentaBaseId: cuentaId, tipo: 'TRANSFERENCIA' },
      _sum: {
        monto: true,
      },
    });

    const transferenciaEntrante = this.prisma.movimiento.aggregate({
      where: { cuentaDestinoId: cuentaId, tipo: 'TRANSFERENCIA' },
      _sum: {
        monto: true,
      },
    });

    const [
      ingresosResultado,
      gastosResultado,
      transferenciaSalienteResultado,
      transferenciaEntranteResultado,
    ] = await Promise.all([
      ingresos,
      gastos,
      transferenciaSaliente,
      transferenciaEntrante,
    ]);

    const totalIngresos = ingresosResultado._sum.monto ?? new Prisma.Decimal(0);
    const totalGastos = gastosResultado._sum.monto ?? new Prisma.Decimal(0);
    const totalTransferenciaSaliente =
      transferenciaSalienteResultado._sum.monto ?? new Prisma.Decimal(0);
    const totalTransferenciaEntrante =
      transferenciaEntranteResultado._sum.monto ?? new Prisma.Decimal(0);

    const saldoTotal = new Prisma.Decimal(cuenta.saldoInicial)
      .plus(totalIngresos)
      .plus(totalTransferenciaEntrante)
      .minus(totalTransferenciaSaliente)
      .minus(totalGastos);

    return { ...cuenta, saldoActual: saldoTotal };
  }

  async calcularSaldoTotal(cuentaId: number) {
    const cuenta = await this.getCuentaById(cuentaId);
    return await this.addSaldo(cuenta);
  }

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  //Crear cuenta
  async createCuenta(data: CreateCuentaDto) {
    const cuenta = await this.prisma.cuenta.create({ data });
    return await this.addSaldo(cuenta);
  }

  //Obtener todas las cuentas
  async getCuentas() {
    const cuentas = await this.prisma.cuenta.findMany();
    return await Promise.all(cuentas.map((cuenta) => this.addSaldo(cuenta)));
  }

  //Obtener cuenta por id
  async getCuentaById(id: number) {
    const cuenta = await this.prisma.cuenta.findUnique({
      where: { cuentaId: id },
    });
    if (!cuenta) {
      throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
    }
    return cuenta;
  }

  //Actualizar cuenta

  async updateCuenta(id: number, data: UpdateCuentaDto) {
    try {
      const cuenta = await this.prisma.cuenta.update({
        where: { cuentaId: id },
        data,
      });
      return await this.addSaldo(cuenta);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  //Eliminar cuenta

  async deleteCuenta(id: number) {
    try {
      return await this.prisma.cuenta.delete({
        where: { cuentaId: id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          `No se puede eliminar la cuenta porque está relacionada con otra entidad`,
        );
      }
      throw error;
    }
  }
}
