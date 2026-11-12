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

  calcularAnio(hoy: Date) {
    const year = hoy.getUTCFullYear();

    const desde = new Date(Date.UTC(year, 0, 1));
    const hasta = new Date(Date.UTC(year + 1, 0, 1));

    return { desde, hasta };
  }

  async getDashboard() {
    const hoy = new Date();
    const periodo = this.calcularPeriodo(hoy, this.diaCobro);
    const anio = this.calcularAnio(hoy);

    const [totales, ultimos, gastosPeriodo, gastosAnio] = await Promise.all([
      this.totales(periodo),
      this.ultimosMovimientos(),
      this.gastosPorCategoria(periodo, true),
      this.gastosPorCategoria(anio, false),
    ]);

    return {
      gastosPorCategoria: { periodo: gastosPeriodo, anio: gastosAnio },
      periodo,
      totales,
      ultimos,
    };
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

  private async gastosPorCategoria(
    rango: { desde: Date; hasta: Date },
    conLimite: boolean,
  ) {
    const categorias = this.prisma.categoria.findMany({
      where: {
        tipo: 'GASTO',
      },
      select: { categoriaId: true, nombre: true, limite: true },
      orderBy: { nombre: 'asc' },
    });

    const sumas = this.prisma.movimiento.groupBy({
      by: 'categoriaId',
      where: {
        tipo: 'GASTO',
        fecha: {
          gte: rango.desde,
          lt: rango.hasta,
        },
      },
      _sum: { monto: true },
    });

    const [cats, grupos] = await Promise.all([categorias, sumas]);

    const mapSums = new Map(grupos.map((g) => [g.categoriaId, g._sum.monto]));

    const result = cats.map((cat) => {
      const importe = mapSums.get(cat.categoriaId) ?? new Prisma.Decimal(0);
      const base = {
        categoriaId: cat.categoriaId,
        nombre: cat.nombre,
        importe,
      };

      if (conLimite && cat.limite !== null) {
        const exceso = Prisma.Decimal.max(importe.minus(cat.limite), 0);
        const dentro = Prisma.Decimal.min(importe, cat.limite);
        const restante = Prisma.Decimal.max(cat.limite.minus(importe), 0);
        const porcentaje = importe.div(cat.limite).times(100).toFixed(0);

        return {
          ...base,
          limite: cat.limite,
          exceso,
          dentro,
          restante,
          porcentaje,
        };
      }
      return {
        ...base,
        limite: null,
        exceso: null,
        dentro: null,
        restante: null,
        porcentaje: null,
      };
    });

    result.sort((a, b) => b.importe.comparedTo(a.importe));

    const salida = result.map((item) => ({
      ...item,
      importe: item.importe.toString(),
      limite: item.limite?.toString() ?? null,
      exceso: item.exceso?.toString() ?? null,
      dentro: item.dentro?.toString() ?? null,
      restante: item.restante?.toString() ?? null,
    }));

    return salida;
  }
}
