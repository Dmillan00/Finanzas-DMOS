import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCuentaDto } from './dto/create-cuenta.dto.js';
import { UpdateCuentaDto } from './dto/update-cuenta.dto.js';
import { Prisma, Cuenta } from '../generated/prisma/client.js';

type BalanceTotals = {
  income: Prisma.Decimal;
  expenses: Prisma.Decimal;
  transferOut: Prisma.Decimal;
  transferIn: Prisma.Decimal;
};

@Injectable()
export class CuentasService {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  //Calcula el saldo actual de una cuenta a partir de sus totales ya leídos.
  //No consulta la BD: así lo comparten addBalance (una cuenta) y findAll (todas)
  private buildBalance(cuenta: Cuenta, totals: BalanceTotals) {
    const saldoTotal = new Prisma.Decimal(cuenta.saldoInicial)
      .plus(totals.income)
      .plus(totals.transferIn)
      .minus(totals.transferOut)
      .minus(totals.expenses);

    return { ...cuenta, saldoActual: saldoTotal };
  }

  //Añade el saldo a una sola cuenta, leyendo sus totales con aggregate
  private async addBalance(cuenta: Cuenta) {
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

    return this.buildBalance(cuenta, {
      income: ingresosResultado._sum.monto ?? new Prisma.Decimal(0),
      expenses: gastosResultado._sum.monto ?? new Prisma.Decimal(0),
      transferOut:
        transferenciaSalienteResultado._sum.monto ?? new Prisma.Decimal(0),
      transferIn:
        transferenciaEntranteResultado._sum.monto ?? new Prisma.Decimal(0),
    });
  }

  //Mostrar una cuenta con su saldo
  async getBalance(cuentaId: number) {
    const cuenta = await this.findOne(cuentaId);
    return await this.addBalance(cuenta);
  }

  //Crear cuenta
  async create(data: CreateCuentaDto) {
    const cuenta = await this.prisma.cuenta.create({ data });
    return await this.addBalance(cuenta);
  }

  //Mostrar todas las cuentas
  async findAll() {
    const cuentas = await this.prisma.cuenta.findMany();

    const totalsByAccountAndType = this.prisma.movimiento.groupBy({
      by: ['cuentaBaseId', 'tipo'],
      _sum: { monto: true },
    });

    const incomingTransferTotals = this.prisma.movimiento.groupBy({
      by: ['cuentaDestinoId'],
      where: { tipo: 'TRANSFERENCIA' },
      _sum: { monto: true },
    });

    const [accountTypeTotals, incomingTotals] = await Promise.all([
      totalsByAccountAndType,
      incomingTransferTotals,
    ]);

    // Ingresos, gastos y transferencias salientes, con clave "id-TIPO"
    const totalsByKey = new Map<string, Prisma.Decimal | null>();

    for (const total of accountTypeTotals) {
      totalsByKey.set(`${total.cuentaBaseId}-${total.tipo}`, total._sum.monto);
    }

    // Transferencias entrantes, con clave el id de la cuenta destino
    const incomingByAccountId = new Map<number, Prisma.Decimal | null>();

    for (const total of incomingTotals) {
      if (total.cuentaDestinoId !== null) {
        incomingByAccountId.set(total.cuentaDestinoId, total._sum.monto);
      }
    }

    return cuentas.map((cuenta) => {
      const totals = {
        income:
          totalsByKey.get(`${cuenta.cuentaId}-INGRESO`) ??
          new Prisma.Decimal(0),
        expenses:
          totalsByKey.get(`${cuenta.cuentaId}-GASTO`) ?? new Prisma.Decimal(0),
        transferOut:
          totalsByKey.get(`${cuenta.cuentaId}-TRANSFERENCIA`) ??
          new Prisma.Decimal(0),
        transferIn:
          incomingByAccountId.get(cuenta.cuentaId) ?? new Prisma.Decimal(0),
      };

      return this.buildBalance(cuenta, totals);
    });
  }

  //Mostrar una cuenta
  async findOne(id: number) {
    const cuenta = await this.prisma.cuenta.findUnique({
      where: { cuentaId: id },
    });
    if (!cuenta) {
      throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
    }
    return cuenta;
  }

  //Actualizar cuenta

  async update(id: number, data: UpdateCuentaDto) {
    try {
      const cuenta = await this.prisma.cuenta.update({
        where: { cuentaId: id },
        data,
      });
      return await this.addBalance(cuenta);
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

  async delete(id: number) {
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
