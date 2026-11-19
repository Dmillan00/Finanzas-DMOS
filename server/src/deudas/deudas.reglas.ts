import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

// Reglas de deuda que comparten movimientos y recurrentes (pagar una cuota).
// Son funciones sueltas y no un service para no meter inyección entre módulos.

// Lo que falta por pagar de una deuda. movimientoExcluido: al editar un pago,
// su importe antiguo no cuenta (se va a sustituir por el nuevo).
async function pendienteDeuda(
  prisma: PrismaService,
  deudaId: number,
  movimientoExcluido?: number,
) {
  const deuda = await prisma.deuda.findUnique({ where: { deudaId } });
  if (!deuda) {
    throw new BadRequestException(`La deuda con ID ${deudaId} no existe`);
  }

  const pagos = await prisma.movimiento.aggregate({
    where: {
      deudaId,
      ...(movimientoExcluido !== undefined && {
        movimientoId: { not: movimientoExcluido },
      }),
    },
    _sum: { monto: true },
  });

  const pagado = pagos._sum.monto ?? new Prisma.Decimal(0);
  return new Prisma.Decimal(deuda.montoTotal).minus(pagado);
}

// 400 si el pago se pasa de lo que falta (el front ya avisa antes)
export async function comprobarPagoDeuda(
  prisma: PrismaService,
  deudaId: number,
  monto: Prisma.Decimal | number | string,
  movimientoExcluido?: number,
) {
  const pendiente = await pendienteDeuda(prisma, deudaId, movimientoExcluido);

  if (pendiente.lessThanOrEqualTo(0)) {
    throw new BadRequestException('Esta deuda ya está saldada');
  }

  if (new Prisma.Decimal(monto).greaterThan(pendiente)) {
    throw new BadRequestException(
      `Solo quedan ${pendiente.toFixed(2)} € por pagar de esta deuda`,
    );
  }
}

// Si el pago deja la deuda a 0, pausa sus cuotas recurrentes
export async function cerrarSiSaldada(prisma: PrismaService, deudaId: number) {
  const pendiente = await pendienteDeuda(prisma, deudaId);

  if (pendiente.lessThanOrEqualTo(0)) {
    await prisma.recurrente.updateMany({
      where: { deudaId, activo: true },
      data: { activo: false },
    });
  }
}
