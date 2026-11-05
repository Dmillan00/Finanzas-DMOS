import type { Dashboard } from '@/components/props';
import { formatearMonto } from '@/libs/formatos';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ESTILO_TIPO = {
  GASTO: {
    icono: ArrowDownRight,
    clases: 'bg-red-500/15 text-red-400',
    signo: '-',
    colorMonto: 'text-red-400',
  },
  INGRESO: {
    icono: ArrowUpRight,
    clases: 'bg-green-500/15 text-green-400',
    signo: '+',
    colorMonto: 'text-sky-400',
  },
};

export default function UltimosMovimientos({
  ultimos,
}: {
  ultimos: Dashboard['ultimos'];
}) {
  return (
    <section className="flex flex-col gap-3 min-w-0">
      <h2 className="text-sm text-muted-foreground">Últimos movimientos</h2>

      {ultimos.length === 0 ? (
        <p className="flex-1 rounded-xl border border-dashed py-12 text-center text-muted-foreground">
          Sin movimientos
        </p>
      ) : (
        <ul className="flex-1 bg-card border rounded-xl divide-y">
          {ultimos.map((m) => {
            const estilo = ESTILO_TIPO[m.tipo];
            const Icono = estilo.icono;
            return (
              <li
                key={m.movimientoId}
                className="flex items-center gap-4 px-4 py-3"
              >
                <div
                  className={cn(
                    'size-10 rounded-lg flex items-center justify-center',
                    estilo.clases,
                  )}
                >
                  <Icono />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.nombre}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {m.categoria?.nombre}
                  </p>
                </div>
                <p
                  className={cn(
                    'font-medium tabular-nums shrink-0',
                    estilo.colorMonto,
                  )}
                >
                  {estilo.signo}
                  {formatearMonto(m.monto)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
