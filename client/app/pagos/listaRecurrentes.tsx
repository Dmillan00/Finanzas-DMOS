import type {
  Categoria,
  Cuenta,
  Deuda,
  Recurrente,
  ResumenRecurrentes,
} from '@/components/props';
import { Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatearMonto, formatearPeriodo } from '@/libs/formatos';
import { Badge } from '@/components/ui/badge';
import TextoDesplegable from '@/components/textoDesplegable';
import AccionesRecurrente from './accionesRecurrente';
import { diasHasta, textoDias } from './utils';

const ESTILO_TIPO = {
  GASTO: {
    clases: 'bg-red-500/15 text-red-400',
    signo: '-',
    colorMonto: 'text-red-400',
  },
  INGRESO: {
    clases: 'bg-green-500/15 text-green-400',
    signo: '+',
    colorMonto: 'text-sky-400',
  },
};

export default function ListaRecurrentes({
  resumen,
  recurrentes,
  cuentas,
  categorias,
  deudas,
}: {
  resumen: ResumenRecurrentes;
  recurrentes: Recurrente[];
  cuentas: Cuenta[];
  categorias: Categoria[];
  deudas: Deuda[];
}) {
  const nombreCuenta = new Map(cuentas.map((c) => [c.cuentaId, c.nombre]));
  const nombreDeuda = new Map(deudas.map((d) => [d.deudaId, d.nombre]));

  const activos = recurrentes.filter((r) => r.activo);
  const secciones = [
    {
      titulo: 'Suscripciones',
      lista: activos.filter((r) => r.esSuscripcion),
    },
    {
      titulo: 'Pagos fijos',
      lista: activos.filter((r) => !r.esSuscripcion),
    },
    {
      titulo: 'Pausados',
      lista: recurrentes.filter((r) => !r.activo),
    },
  ];

  // El back ya los devuelve ordenados por proximaFecha asc
  const proximo = activos[0];

  if (recurrentes.length === 0) {
    return (
      <p className="mt-5 rounded-xl border border-dashed py-12 text-center text-muted-foreground">
        Sin recurrentes
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-5">
      <div className="grid grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1 pr-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Suscripciones al mes
          </span>
          <span className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {formatearMonto(resumen.suscripcionesMes)}
          </span>
          <span className="text-xs text-muted-foreground">
            Anuales prorrateadas ÷ 12
          </span>
        </div>
        <div className="flex flex-col gap-1 border-l pl-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Próximo pago
          </span>
          {proximo ? (
            <>
              <span className="text-lg font-semibold truncate">
                {proximo.nombre}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatearPeriodo(proximo.proximaFecha)} ·{' '}
                {textoDias(diasHasta(proximo.proximaFecha))}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Ninguno activo
            </span>
          )}
        </div>
      </div>

      {secciones.map((seccion) =>
        seccion.lista.length === 0 ? null : (
          <section key={seccion.titulo}>
            <p className="text-sm text-muted-foreground mb-2">
              {seccion.titulo} · {seccion.lista.length}
            </p>
            <ul
              className={cn(
                'rounded-xl border divide-y overflow-hidden',
                seccion.titulo === 'Pausados' && 'border-dashed opacity-70',
              )}
            >
              {seccion.lista.map((recurrente) => {
                const estilo = ESTILO_TIPO[recurrente.tipo];
                const fecha = formatearPeriodo(recurrente.proximaFecha);
                const cuando = recurrente.activo
                  ? textoDias(diasHasta(recurrente.proximaFecha))
                  : 'Pausado';
                const deuda =
                  recurrente.deudaId !== null
                    ? nombreDeuda.get(recurrente.deudaId)
                    : undefined;
                const datos = [
                  recurrente.categoria.nombre,
                  nombreCuenta.get(recurrente.cuentaId),
                  deuda ? 'Deuda: ' + deuda : undefined,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <li
                    key={recurrente.recurrenteId}
                    className="flex items-center gap-3 lg:gap-4 px-4 py-3"
                    style={{ backgroundColor: 'var(--card)' }}
                  >
                    <div
                      className={cn(
                        'size-10 shrink-0 rounded-lg flex items-center justify-center',
                        recurrente.activo
                          ? estilo.clases
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Repeat />
                    </div>

                    {/* Móvil: la fecha va en la línea secundaria */}
                    <div className="flex flex-1 min-w-0 lg:hidden">
                      <TextoDesplegable
                        principal={recurrente.nombre}
                        secundario={fecha + ' · ' + cuando}
                      />
                    </div>
                    <div className="hidden flex-1 min-w-0 lg:flex">
                      <TextoDesplegable
                        principal={recurrente.nombre}
                        secundario={datos}
                      />
                    </div>

                    <Badge variant="outline" className="hidden lg:inline-flex">
                      {recurrente.periodicidad === 'ANUAL'
                        ? 'Anual'
                        : 'Mensual'}
                    </Badge>

                    <div className="hidden lg:flex w-28 flex-col">
                      <span className="font-medium">{fecha}</span>
                      <span className="text-xs text-muted-foreground">
                        {cuando}
                      </span>
                    </div>

                    <p
                      className={cn(
                        'tabular-nums font-medium text-right lg:w-28',
                        recurrente.activo
                          ? estilo.colorMonto
                          : 'text-muted-foreground',
                      )}
                    >
                      {estilo.signo}
                      {formatearMonto(recurrente.monto)}
                    </p>

                    <AccionesRecurrente
                      recurrente={recurrente}
                      cuentas={cuentas}
                      categorias={categorias}
                      deudas={deudas}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
