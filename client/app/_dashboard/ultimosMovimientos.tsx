import type { Dashboard } from '@/components/props';
import { formatearMonto } from '@/libs/formatos';

export default function UltimosMovimientos({
  ultimos,
}: {
  ultimos: Dashboard['ultimos'];
}) {
  if (ultimos.length === 0) {
    return (
      <section>
        <h2>Ultimos movimientos</h2>
        <p>Sin movimientos</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Ultimos movimientos</h2>
      <ul>
        {ultimos.map((m) => {
          const color =
            m.tipo === 'INGRESO' ? 'text-green-500' : 'text-red-500';
          const signo = m.tipo === 'INGRESO' ? '+' : '−';
          return (
            <li key={m.movimientoId}>
              <p>{m.nombre}</p>
              <p>{m.categoria?.nombre}</p>
              <p className={color}>
                {signo}
                {formatearMonto(m.monto)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
