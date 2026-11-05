import type { Dashboard } from '@/components/props';
import { formatearPeriodo, formatearMonto } from '@/libs/formatos';
import { cn } from '@/lib/utils';

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

  const titulo = `${desde} – ${hastaFormateado}`;
  const queda = formatearMonto(totales.queda);
  const negativo = Number(totales.queda) < 0;

  return (
    <section className="flex flex-col gap-3 border-l pl-5 min-w-0">
      <h2 className="text-muted-foreground text-xs uppercase tracking-wider">
        {titulo}
      </h2>
      <div className="flex-1  flex flex-col justify-center gap-5 @container">
        <p
          className={cn(
            '  text-[clamp(1.5rem,14cqi,3rem)] font-semibold tabular-nums',
            negativo && 'text-red-400',
          )}
        >
          {queda}
        </p>
        <div className="flex flex-col gap-2 tabular-nums">
          <div className="flex justify-between">
            <span className="text-muted-foreground">↑ Ingresos</span>
            <span className="text-sky-400">{ingresos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">↓ Gastos</span>
            <span className="text-red-400">{gastos}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
