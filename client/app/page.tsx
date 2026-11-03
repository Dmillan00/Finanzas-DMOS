import type { Categoria, Cuenta, Dashboard } from '@/components/props';
import EsteMes from './_dashboard/esteMes';
import UltimosMovimientos from './_dashboard/ultimosMovimientos';
import CarruselCuentas from './_dashboard/carruselCuentas';
import NuevoMovimiento from './_dashboard/nuevoMovimiento';

export default async function Home() {
  const [resDashboard, resCuentas, resCategorias] = await Promise.all([
    fetch(process.env.NEXT_PUBLIC_API_URL + '/dashboard'),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/cuentas'),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/categorias'),
  ]);

  if (!resDashboard.ok || !resCuentas.ok || !resCategorias.ok) {
    throw new Error('Error al obtener el dashboard, cuentas o categorias');
  }

  const dashboard: Dashboard = await resDashboard.json();
  const cuentas: Cuenta[] = await resCuentas.json();
  const categorias: Categoria[] = await resCategorias.json();

  return (
    <main>
      <h1>Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <CarruselCuentas cuentas={cuentas}></CarruselCuentas>
        <EsteMes periodo={dashboard.periodo} totales={dashboard.totales} />
        <NuevoMovimiento
          categorias={categorias}
          cuentas={cuentas}
        ></NuevoMovimiento>
        <section className="col-span-2">Grafico (todo)</section>
        <UltimosMovimientos ultimos={dashboard.ultimos} />
      </div>
    </main>
  );
}
