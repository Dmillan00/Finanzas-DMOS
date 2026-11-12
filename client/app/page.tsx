import type { Categoria, Cuenta, Dashboard } from '@/components/props';
import EsteMes from './_dashboard/esteMes';
import UltimosMovimientos from './_dashboard/ultimosMovimientos';
import CarruselCuentas from './_dashboard/carruselCuentas';
import NuevoMovimiento from './_dashboard/nuevoMovimiento';
import GraficoGastos from './_dashboard/graficoGastos';
import { connection } from 'next/server';

export default async function Home() {
  await connection();
  const [resDashboard, resCuentas, resCategorias] = await Promise.all([
    fetch(process.env.API_URL + '/dashboard'),
    fetch(process.env.API_URL + '/cuentas'),
    fetch(process.env.API_URL + '/categorias'),
  ]);

  if (!resDashboard.ok || !resCuentas.ok || !resCategorias.ok) {
    throw new Error('Error al obtener el dashboard, cuentas o categorias');
  }

  const dashboard: Dashboard = await resDashboard.json();
  const cuentas: Cuenta[] = await resCuentas.json();
  const categorias: Categoria[] = await resCategorias.json();

  return (
    <main className="w-full max-w-7xl mx-auto px-5 py-2">
      <h1 className="text-3xl font-semibold text-primary">Dashboard</h1>

      <div className="stagger grid grid-cols-3 gap-x-4 gap-y-6 mt-5">
        <CarruselCuentas cuentas={cuentas}></CarruselCuentas>
        <EsteMes periodo={dashboard.periodo} totales={dashboard.totales} />
        <NuevoMovimiento
          categorias={categorias}
          cuentas={cuentas}
        ></NuevoMovimiento>
        <section className="col-span-2 flex flex-col gap-3 min-w-0">
          <h2 className="text-sm text-muted-foreground">Gráfico</h2>
          <div className="flex-1 min-h-75 bg-card border border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
            <GraficoGastos gastosPorCategoria={dashboard.gastosPorCategoria} />
          </div>
        </section>
        <UltimosMovimientos ultimos={dashboard.ultimos} />
      </div>
    </main>
  );
}
