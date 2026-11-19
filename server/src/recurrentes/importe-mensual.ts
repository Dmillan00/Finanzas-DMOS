import {
  Periodicidad,
  Prisma,
  type Recurrente,
} from '../generated/prisma/client.js';

// Importe al mes de un recurrente: los anuales se prorratean entre 12.
// Lo usan los resúmenes de recurrentes y de deudas (cuotas al mes).
export function importeMensual(
  recurrente: Pick<Recurrente, 'monto' | 'periodicidad'>,
) {
  const monto = new Prisma.Decimal(recurrente.monto);
  return recurrente.periodicidad === Periodicidad.ANUAL
    ? monto.div(12)
    : monto;
}
