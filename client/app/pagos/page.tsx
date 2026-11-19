import type {
  Categoria,
  Cuenta,
  Deuda,
  Recurrente,
  ResumenDeudas,
  ResumenRecurrentes,
} from '@/components/props';
import { connection } from 'next/server';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ListaRecurrentes from './listaRecurrentes';
import ListaDeudas from './listaDeudas';
import NuevoRecurrente from './nuevoRecurrente';
import NuevaDeuda from './nuevaDeuda';

const PESTANAS = [
  { valor: 'recurrentes', label: 'Recurrentes' },
  { valor: 'deudas', label: 'Deudas' },
] as const;

export default async function Pagos({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await connection();
  const params = await searchParams;
  const tab = params.tab === 'deudas' ? 'deudas' : 'recurrentes';

  // Los totales los calcula el back (resumen de la pestaña activa)
  const [resRecurrentes, resDeudas, resCuentas, resCategorias, resResumen] =
    await Promise.all([
      fetch(process.env.API_URL + '/recurrentes'),
      fetch(process.env.API_URL + '/deudas'),
      fetch(process.env.API_URL + '/cuentas'),
      fetch(process.env.API_URL + '/categorias'),
      fetch(process.env.API_URL + '/' + tab + '/resumen'),
    ]);

  if (
    !resRecurrentes.ok ||
    !resDeudas.ok ||
    !resCuentas.ok ||
    !resCategorias.ok ||
    !resResumen.ok
  ) {
    throw new Error('Error al obtener los pagos');
  }

  const recurrentes: Recurrente[] = await resRecurrentes.json();
  const deudas: Deuda[] = await resDeudas.json();
  const cuentas: Cuenta[] = await resCuentas.json();
  const categorias: Categoria[] = await resCategorias.json();
  const resumen: ResumenRecurrentes | ResumenDeudas = await resResumen.json();

  return (
    <main className="px-5 py-2 mx-auto w-full max-w-7xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Pagos</h1>
          <span className="text-muted-foreground">
            {tab === 'deudas'
              ? `${deudas.length} deudas`
              : `${recurrentes.length} recurrentes`}
          </span>
        </div>
        {tab === 'deudas' ? (
          <NuevaDeuda />
        ) : (
          <NuevoRecurrente
            cuentas={cuentas}
            categorias={categorias}
            deudas={deudas}
          />
        )}
      </div>

      {/* Pestañas por searchParams: la página sigue siendo Server Component */}
      <nav aria-label="Secciones de pagos" className="mt-4 flex gap-6 border-b">
        {PESTANAS.map((p) => (
          <Link
            key={p.valor}
            href={'/pagos?tab=' + p.valor}
            aria-current={tab === p.valor ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 py-2 font-medium transition-colors',
              tab === p.valor
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      {tab === 'deudas' ? (
        <ListaDeudas
          resumen={resumen as ResumenDeudas}
          deudas={deudas}
          recurrentes={recurrentes}
          cuentas={cuentas}
          categorias={categorias}
        />
      ) : (
        <ListaRecurrentes
          resumen={resumen as ResumenRecurrentes}
          recurrentes={recurrentes}
          cuentas={cuentas}
          categorias={categorias}
          deudas={deudas}
        />
      )}
    </main>
  );
}
