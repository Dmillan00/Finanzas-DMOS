type Movimiento = {
  movimientoId: number;
  nombre: string;
  monto: string;
  tipo: 'INGRESO' | 'GASTO' | 'TRANSFERENCIA';
  fecha: string;
  nota: string | null;
  cuentaBaseId: number;
  cuentaDestinoId: number | null;
  categoria: { categoriaId: number; nombre: string } | null;
};

type Cuenta = {
  cuentaId: number;
  nombre: string;
  saldoInicial: string;
};

export default async function Movimientos() {
  const [resCuenta, resMovimientos] = await Promise.all([
    fetch(process.env.NEXT_PUBLIC_API_URL + '/cuentas'),
    fetch(process.env.NEXT_PUBLIC_API_URL + '/movimientos'),
  ]);

  if (!resCuenta.ok || !resMovimientos.ok) {
    throw new Error('Error al obtener las cuentas o movimientos');
  }

  const cuentas: Cuenta[] = await resCuenta.json();
  const movimientos: Movimiento[] = await resMovimientos.json();

  const nombreCuenta = new Map(
    cuentas.map((cuenta) => [cuenta.cuentaId, cuenta.nombre]),
  );

  if (movimientos.length === 0) {
    return (
      <main>
        <h2>La lista esta vacia</h2>
      </main>
    );
  }
  return (
    <main>
      <h1>Movimientos</h1>
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
    </main>
  );
}
