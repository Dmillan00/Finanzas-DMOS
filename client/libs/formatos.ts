const monto = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});
const fecha = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid' });
const periodo = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export function formatearMonto(valor: string) {
  return monto.format(Number(valor));
}

export function formatearFecha(iso: string) {
  return fecha.format(new Date(iso));
}

export function formatearPeriodo(iso: string) {
  return periodo.format(new Date(iso));
}
