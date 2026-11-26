import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class DashboardService {
  private readonly payDay = Number(process.env.DIA_COBRO);
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  //Periodo de cobro que contiene a `today`: empieza el día `day` (incluido) y
  //termina el mismo día del mes siguiente (excluido). Antes de ese día, el
  //periodo es el que empezó el mes anterior
  buildPeriod(today: Date, day: number) {
    const year = today.getUTCFullYear();
    let month = today.getUTCMonth();

    if (today.getUTCDate() < day) {
      month = month - 1;
    }

    const desde = new Date(Date.UTC(year, month, day));
    const hasta = new Date(Date.UTC(year, month + 1, day));

    return { desde, hasta };
  }

  //Año natural de `today`: del 1 de enero (incluido) al 1 de enero siguiente
  //(excluido)
  buildYear(today: Date) {
    const year = today.getUTCFullYear();

    const desde = new Date(Date.UTC(year, 0, 1));
    const hasta = new Date(Date.UTC(year + 1, 0, 1));

    return { desde, hasta };
  }

  //Datos del dashboard: totales y gastos por categoría del periodo de cobro
  //(con límites) y del año (sin límites), más los últimos movimientos
  async getDashboard() {
    const today = new Date();
    const period = this.buildPeriod(today, this.payDay);
    const year = this.buildYear(today);

    const [totals, latest, periodExpenses, yearExpenses] = await Promise.all([
      this.totals(period),
      this.lastMovements(),
      this.expensesByCategory(period, true),
      this.expensesByCategory(year, false),
    ]);

    return {
      gastosPorCategoria: { periodo: periodExpenses, anio: yearExpenses },
      periodo: period,
      totales: totals,
      ultimos: latest,
    };
  }

  //Ingresos, gastos y lo que queda en el periodo. Las transferencias no cuentan
  private async totals(period: { desde: Date; hasta: Date }) {
    const income = this.prisma.movimiento.aggregate({
      where: {
        tipo: 'INGRESO',
        fecha: {
          gte: period.desde,
          lt: period.hasta,
        },
      },
      _sum: {
        monto: true,
      },
    });

    const expenses = this.prisma.movimiento.aggregate({
      where: {
        tipo: 'GASTO',
        fecha: {
          gte: period.desde,
          lt: period.hasta,
        },
      },
      _sum: {
        monto: true,
      },
    });

    const [incomeResult, expensesResult] = await Promise.all([
      income,
      expenses,
    ]);

    const totalIncome = incomeResult._sum.monto ?? new Prisma.Decimal(0);
    const totalExpense = expensesResult._sum.monto ?? new Prisma.Decimal(0);

    const remaining = totalIncome.minus(totalExpense);

    return {
      ingresos: totalIncome.toString(),
      gastos: totalExpense.toString(),
      queda: remaining.toString(),
    };
  }

  //Los 5 últimos movimientos de ingreso o gasto, por orden de creación (a
  //propósito: sale lo último apuntado aunque su fecha sea anterior)
  private async lastMovements() {
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

  //Gasto de cada categoría de GASTO dentro del rango, de mayor a menor. Con
  //`withLimit`, las que tienen límite añaden cuánto va dentro, cuánto se pasa,
  //cuánto queda y el porcentaje; el resto lleva esos campos a null
  private async expensesByCategory(
    range: { desde: Date; hasta: Date },
    withLimit: boolean,
  ) {
    const categoriesQuery = this.prisma.categoria.findMany({
      where: {
        tipo: 'GASTO',
      },
      select: { categoriaId: true, nombre: true, limite: true },
      orderBy: { nombre: 'asc' },
    });

    const sumsQuery = this.prisma.movimiento.groupBy({
      by: 'categoriaId',
      where: {
        tipo: 'GASTO',
        fecha: {
          gte: range.desde,
          lt: range.hasta,
        },
      },
      _sum: { monto: true },
    });

    const [categories, groups] = await Promise.all([
      categoriesQuery,
      sumsQuery,
    ]);

    //Suma de gasto por id de categoría, para leerla sin recorrer la lista
    const sumsByCategoryId = new Map(
      groups.map((g) => [g.categoriaId, g._sum.monto]),
    );

    const result = categories.map((category) => {
      const importe =
        sumsByCategoryId.get(category.categoriaId) ?? new Prisma.Decimal(0);
      const base = {
        categoriaId: category.categoriaId,
        nombre: category.nombre,
        importe,
      };

      if (withLimit && category.limite !== null) {
        const exceso = Prisma.Decimal.max(importe.minus(category.limite), 0);
        const dentro = Prisma.Decimal.min(importe, category.limite);
        const restante = Prisma.Decimal.max(category.limite.minus(importe), 0);
        const porcentaje = importe.div(category.limite).times(100).toFixed(0);

        return {
          ...base,
          limite: category.limite,
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

    //Los importes viajan al front como texto (Decimal)
    const output = result.map((item) => ({
      ...item,
      importe: item.importe.toString(),
      limite: item.limite?.toString() ?? null,
      exceso: item.exceso?.toString() ?? null,
      dentro: item.dentro?.toString() ?? null,
      restante: item.restante?.toString() ?? null,
    }));

    return output;
  }
}
