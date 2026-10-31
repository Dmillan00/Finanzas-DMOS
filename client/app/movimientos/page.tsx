import MovimientoForm from './movimientoForm';

import type { Cuenta, Categoria, Movimiento } from '@/components/props';
import EditarMovimiento from './editarMovimiento';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default async function Movimientos({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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
    fetch(process.env.NEXT_PUBLIC_API_URL + '/cuentas'),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/movimientos?' + query),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/categorias'),
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

  return (
    <main>
      <h1>Movimientos</h1>
      <MovimientoForm cuentas={cuentas} categorias={categorias} />
      <form method="get">
        <select name="month" defaultValue={month}>
          {MESES.map((nombre, i) => (
            <option key={nombre} value={i + 1}>
              {nombre}
            </option>
          ))}
        </select>
        <input name="year" defaultValue={year} type="number" />
        <button type="submit">filtrar</button>
      </form>
      {movimientos.length === 0 ? (
        <h2>La lista esta vacia</h2>
      ) : (
        <ul>
          {movimientos.map((movimiento) => (
            <li key={movimiento.movimientoId}>
              <p>{movimiento.nombre}</p>
              <p>
                {new Intl.NumberFormat('es-Es', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(Number(movimiento.monto))}
              </p>
              <EditarMovimiento
                cuentas={cuentas}
                categorias={categorias}
                movimiento={movimiento}
              />

              <p>
                {new Intl.DateTimeFormat('es-Es', {
                  timeZone: 'Europe/Madrid',
                }).format(new Date(movimiento.fecha))}
              </p>
              <p>{movimiento.tipo}</p>
              <p>{nombreCuenta.get(movimiento.cuentaBaseId)}</p>

              {movimiento.cuentaDestinoId !== null && (
                <p>{nombreCuenta.get(movimiento.cuentaDestinoId)}</p>
              )}
              <p>{movimiento.categoria?.nombre ?? 'Sin categoria'}</p>
              <p>{movimiento.nota}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
