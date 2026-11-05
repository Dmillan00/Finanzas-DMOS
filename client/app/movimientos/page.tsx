import { formatearDia, formatearMonto } from '@/libs/formatos';
import type { Cuenta, Categoria, Movimiento } from '@/components/props';
import { ArrowLeftRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import EditarMovimiento from './editarMovimiento';
import EliminarMovimiento from './eliminarMovimiento';
import { Button } from '@/components/ui/button';
import { connection } from 'next/server';
import NuevoMovimiento from './nuevoMovimiento';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  TRANSFERENCIA: {
    icono: ArrowLeftRight,
    clases: 'bg-primary/15 text-primary',
    signo: '',
    colorMonto: '',
  },
};

export default async function Movimientos({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const params = await searchParams;

  let year = Number(params.year);
  let month = Number(params.month);

  if (!Number.isInteger(year) || year < 1) {
    year = new Date().getFullYear();
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    month = new Date().getMonth() + 1;
  }

  const query = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  const [resCuenta, resMovimientos, resCategorias] = await Promise.all([
    fetch(process.env.API_URL + '/cuentas'),
    fetch(process.env.API_URL + '/movimientos?' + query),
    fetch(process.env.API_URL + '/categorias'),
  ]);

  if (!resCuenta.ok || !resMovimientos.ok || !resCategorias.ok) {
    throw new Error('Error al obtener las cuentas, movimientos o categorias');
  }

  const cuentas: Cuenta[] = await resCuenta.json();
  const categorias: Categoria[] = await resCategorias.json();
  const movimientos: Movimiento[] = await resMovimientos.json();

  const nombreCuenta = new Map(
    cuentas.map((cuenta) => [cuenta.cuentaId, cuenta.nombre]),
  );

  const selectMeses = [
    { label: 'Enero', value: '1' },
    { label: 'Febrero', value: '2' },
    { label: 'Marzo', value: '3' },
    { label: 'Abril', value: '4' },
    { label: 'Mayo', value: '5' },
    { label: 'Junio', value: '6' },
    { label: 'Julio', value: '7' },
    { label: 'Agosto', value: '8' },
    { label: 'Septiembre', value: '9' },
    { label: 'Octubre', value: '10' },
    { label: 'Noviembre', value: '11' },
    { label: 'Diciembre', value: '12' },
  ];

  const grupos = new Map<string, Movimiento[]>();

  for (const mov of movimientos) {
    const clave = formatearDia(mov.fecha);

    if (!grupos.has(clave)) {
      grupos.set(clave, []);
    }

    grupos.get(clave)?.push(mov);
  }

  return (
    <main className="px-5 py-2 mx-auto w-full max-w-7xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Movimientos</h1>
          <span className="text-muted-foreground">
            {movimientos.length} movimientos en {selectMeses[month - 1].label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <form method="get" className="flex items-center gap-2">
            <Select
              items={selectMeses}
              name="month"
              defaultValue={String(month)}
            >
              <SelectTrigger id="month" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {selectMeses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              className="w-24"
              name="year"
              defaultValue={year}
              type="number"
            />
            <Button variant="outline" type="submit">
              Filtrar
            </Button>
          </form>
          <NuevoMovimiento cuentas={cuentas} categorias={categorias} />
        </div>
      </div>

      {grupos.size === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed py-12 text-center text-muted-foreground">
          Sin movimientos en {selectMeses[month - 1].label} de {year}
        </p>
      ) : (
        <div className="flex flex-col stagger  gap-6 mt-5">
          {[...grupos].map(([dia, lista]) => (
            <section key={dia}>
              <p className="text-sm text-muted-foreground mb-2 first-letter:uppercase">
                {dia}
              </p>
              <ul className="rounded-xl border divide-y overflow-hidden">
                {lista.map((movimiento) => {
                  const partes =
                    movimiento.tipo === 'TRANSFERENCIA'
                      ? [
                          [
                            nombreCuenta.get(movimiento.cuentaBaseId),
                            movimiento.cuentaDestinoId !== null
                              ? nombreCuenta.get(movimiento.cuentaDestinoId)
                              : undefined,
                          ]
                            .filter(Boolean)
                            .join(' → '),
                          movimiento.nota,
                        ]
                      : [
                          movimiento.categoria?.nombre,
                          nombreCuenta.get(movimiento.cuentaBaseId),
                          movimiento.nota,
                        ];

                  const datos = partes.filter(Boolean).join(' · ');
                  const estilo = ESTILO_TIPO[movimiento.tipo];
                  const Icono = estilo.icono;

                  return (
                    <li
                      className="flex items-center gap-4 px-4 py-3"
                      key={movimiento.movimientoId}
                      style={{ backgroundColor: 'var(--card)' }}
                    >
                      <div
                        className={cn(
                          'size-10 rounded-lg flex items-center justify-center',
                          estilo.clases,
                        )}
                      >
                        <Icono></Icono>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{movimiento.nombre}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {datos}
                        </p>
                      </div>

                      <p
                        className={cn(
                          'tabular-nums font-medium',
                          estilo.colorMonto,
                        )}
                      >
                        {estilo.signo}
                        {formatearMonto(movimiento.monto)}
                      </p>

                      <EditarMovimiento
                        cuentas={cuentas}
                        categorias={categorias}
                        movimiento={movimiento}
                      />
                      <EliminarMovimiento movimiento={movimiento} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
