// Días desde hoy (en Madrid) hasta la fecha del recurrente.
// proximaFecha se guarda a medianoche UTC, así que se compara día contra día.
export function diasHasta(iso: string) {
  const hoy = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
  }).format(new Date()); // 'YYYY-MM-DD'
  const [y, m, d] = hoy.split('-').map(Number);
  const hoyUTC = Date.UTC(y, m - 1, d);
  return Math.round((new Date(iso).getTime() - hoyUTC) / 86_400_000);
}

export function textoDias(dias: number) {
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'mañana';
  if (dias > 1) return `en ${dias} días`;
  if (dias === -1) return 'ayer';
  return `hace ${-dias} días`;
}
