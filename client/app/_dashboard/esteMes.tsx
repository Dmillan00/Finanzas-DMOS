import type { Dashboard } from '@/components/props';
import { formatearPeriodo, formatearMonto } from '@/libs/formatos';

export default function EsteMes({
  periodo,
  totales,
}: {
  periodo: Dashboard['periodo'];
  totales: Dashboard['totales'];
}) {
  const desde = formatearPeriodo(periodo.desde);

  const hastaMs = new Date(periodo.hasta).getTime() - 24 * 60 * 60 * 1000;
  const hastaFormateado = formatearPeriodo(new Date(hastaMs).toISOString());
  const ingresos = formatearMonto(totales.ingresos);
  const gastos = formatearMonto(totales.gastos);

  const titulo = `${desde} - ${hastaFormateado}`;
  const queda = formatearMonto(totales.queda);

  return (
    <section>
      <h2>{titulo}</h2>
      <p className="text-3xl">Queda: {queda}</p>
      <p className="text-sm">
        Ingresos: {ingresos} - Gastos: {gastos}
      </p>
    </section>
  );
}
