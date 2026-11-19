import type {
  Categoria,
  Cuenta,
  Deuda,
  Recurrente,
  ResumenDeudas,
} from '@/components/props';
import { CircleCheck, Landmark, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatearMonto, formatearPeriodo } from '@/libs/formatos';
import AccionesDeuda from './accionesDeuda';

export default function ListaDeudas({
  resumen,
  deudas,
  recurrentes,
  cuentas,
  categorias,
}: {
  resumen: ResumenDeudas;
  deudas: Deuda[];
  recurrentes: Recurrente[];
  cuentas: Cuenta[];
  categorias: Categoria[];
}) {
  if (deudas.length === 0) {
    return (
      <p className="mt-5 rounded-xl border border-dashed py-12 text-center text-muted-foreground">
        Sin deudas
      </p>
    );
  }

  // Saldada = pendiente a 0 (lo calcula el back, sin campo en BD)
  const abiertas = deudas.filter((d) => !d.saldada);
  const saldadas = deudas.filter((d) => d.saldada);

  // Cuotas = recurrentes activos enlazados a una deuda
  const cuotas = recurrentes.filter((r) => r.activo && r.deudaId !== null);

  return (
    <div className="flex flex-col gap-6 mt-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4">
        <div className="flex flex-col gap-1 pr-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Total pendiente
          </span>
          <span className="text-2xl lg:text-3xl font-semibold tabular-nums text-red-400">
            {formatearMonto(resumen.pendiente)}
          </span>
          <span className="text-xs text-muted-foreground">
            De {formatearMonto(resumen.total)} en {resumen.numDeudas} deudas
          </span>
        </div>
        <div className="flex flex-col gap-1 border-l pl-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Pagado
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {formatearMonto(resumen.pagado)}
          </span>
          <span className="text-sm text-muted-foreground">
            {resumen.porcentaje} % del total
          </span>
        </div>
        <div className="flex flex-col gap-1 lg:border-l lg:pl-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Cuotas al mes
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {formatearMonto(resumen.cuotasMes)}
          </span>
          <span className="text-sm text-muted-foreground">
            Recurrentes enlazados
          </span>
        </div>
      </div>

      {[
        { titulo: 'Abiertas', lista: abiertas },
        { titulo: 'Saldadas', lista: saldadas },
      ].map((seccion) =>
        seccion.lista.length === 0 ? null : (
          <section key={seccion.titulo}>
            <p className="text-sm text-muted-foreground mb-2">
              {seccion.titulo} · {seccion.lista.length}
            </p>
            <div
              className={cn(
                'flex flex-col gap-3',
                seccion.titulo === 'Saldadas' && 'opacity-70',
              )}
            >
              {seccion.lista.map((deuda) => {
                const saldada = deuda.saldada;
                const cuotasDeuda = cuotas.filter(
                  (r) => r.deudaId === deuda.deudaId,
                );

                return (
                  <article
                    key={deuda.deudaId}
                    className="rounded-xl border p-4 lg:p-5 flex flex-col gap-4"
                    style={{ backgroundColor: 'var(--card)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'size-10 shrink-0 rounded-lg flex items-center justify-center',
                          saldada
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-red-500/15 text-red-400',
                        )}
                      >
                        {saldada ? <CircleCheck /> : <Landmark />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold truncate">
                            {deuda.nombre}
                          </h2>
                          {saldada && (
                            <Badge
                              variant="outline"
                              className="border-green-500/40 text-green-400"
                            >
                              Saldada
                            </Badge>
                          )}
                        </div>
                        {deuda.nota && (
                          <p className="text-sm text-muted-foreground truncate">
                            {deuda.nota}
                          </p>
                        )}
                      </div>
                      <AccionesDeuda
                        deuda={deuda}
                        saldada={saldada}
                        deudas={deudas}
                        cuentas={cuentas}
                        categorias={categorias}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div
                        role="progressbar"
                        aria-label={'Pagado de ' + deuda.nombre}
                        aria-valuenow={Number(deuda.porcentaje)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2 rounded-full bg-muted overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: deuda.porcentaje + '%' }}
                        />
                      </div>
                      <div className="flex flex-wrap justify-between gap-2 text-sm tabular-nums text-muted-foreground">
                        <span>
                          Pagado{' '}
                          <span className="text-foreground font-medium">
                            {formatearMonto(deuda.pagado)}
                          </span>{' '}
                          de {formatearMonto(deuda.montoTotal)}
                        </span>
                        <span>
                          Queda{' '}
                          <span className="text-foreground font-semibold text-base">
                            {formatearMonto(deuda.pendiente)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t pt-3 text-sm text-muted-foreground">
                      <Repeat className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {saldada
                          ? 'Saldada · sus cuotas se han pausado'
                          : cuotasDeuda.length === 0
                            ? 'Sin cuota fija · pagos sueltos con "Añadir pago"'
                            : cuotasDeuda
                                .map(
                                  (r) =>
                                    `Cuota: ${r.nombre} · ${formatearMonto(r.monto)} / ${
                                      r.periodicidad === 'ANUAL' ? 'año' : 'mes'
                                    } · próxima ${formatearPeriodo(r.proximaFecha)}`,
                                )
                                .join(' — ')}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
