'use client';

import type { Cuenta } from '@/components/props';
import { useState } from 'react';
import TarjetaCuenta from '@/components/tarjetaCuenta';

export default function CarruselCuentas({ cuentas }: { cuentas: Cuenta[] }) {
  const [indice, setIndice] = useState(0);
  const cuenta = cuentas[indice];

  if (cuentas.length === 0) {
    return (
      <section>
        <h2>Cuentas</h2>
        <p>Sin cuentas</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Cuentas</h2>
      <TarjetaCuenta cuenta={cuenta}>
        <ul className="flex gap-2 absolute right-3.5 top-1 ">
          {cuentas.map((c, i) => {
            return (
              <li key={c.cuentaId}>
                <button
                  className={
                    i === indice
                      ? 'w-2 h-2 rounded-full bg-black'
                      : 'w-2 h-2 rounded-full bg-white/40'
                  }
                  type="button"
                  onClick={() => setIndice(i)}
                  aria-label={c.nombre}
                ></button>
              </li>
            );
          })}
        </ul>
      </TarjetaCuenta>
    </section>
  );
}
