import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class DashboardService {
  private readonly diaCobro = Number(process.env.DIA_COBRO);
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  calcularPeriodo(hoy: Date, dia: number) {
    const year = hoy.getUTCFullYear();
    let mes = hoy.getUTCMonth();

    if (hoy.getUTCDate() < dia) {
      mes = mes - 1;
    }

    const desde = new Date(Date.UTC(year, mes, dia));
    const hasta = new Date(Date.UTC(year, mes + 1, dia));

    return { desde, hasta };
  }

  async getDashboard() {
    const periodo = this.calcularPeriodo(new Date(), this.diaCobro);

    const [totales, ultimos] = await Promise.all([
      this.totales(periodo),
      this.ultimosMovimientos(),
    ]);

    return { periodo, totales, ultimos };
  }

  private async totales(periodo: { desde: Date; hasta: Date }) {
    const ingresos = this.prisma.movimiento.aggregate({
      where: {
        tipo: 'INGRESO',
        fecha: {
          gte: periodo.desde,
          lt: periodo.hasta,
        },
      },
      _sum: {
        monto: true,
      },
    });

    const gastos = this.prisma.movimiento.aggregate({
      where: {
        tipo: 'GASTO',
        fecha: {
          gte: periodo.desde,
          lt: periodo.hasta,
        },
      },
      _sum: {
        monto: true,
      },
    });

    const [ingresosResultado, gastosResultado] = await Promise.all([
      ingresos,
      gastos,
    ]);

    const totalIngresos = ingresosResultado._sum.monto ?? new Prisma.Decimal(0);
    const totalGastos = gastosResultado._sum.monto ?? new Prisma.Decimal(0);

    const resto = totalIngresos.minus(totalGastos);

    return {
      ingresos: totalIngresos.toString(),
      gastos: totalGastos.toString(),
      queda: resto.toString(),
    };
  }

  private async ultimosMovimientos() {
    return this.prisma.movimiento.findMany({
      where: {
        tipo: { in: ['GASTO', 'INGRESO'] },
      },
      orderBy: { movimientoId: 'desc' },
      take: 5,
      select: {
        nombre: true,
        monto: true,
        tipo: true,
        movimientoId: true,
        categoria: { select: { nombre: true } },
      },
    });
  }
}
