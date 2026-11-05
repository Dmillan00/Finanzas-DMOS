'use client';

import type { Cuenta } from '@/components/props';
import { useState } from 'react';
import TarjetaCuenta from '@/components/tarjetaCuenta';
import { cn } from '@/lib/utils';

export default function CarruselCuentas({ cuentas }: { cuentas: Cuenta[] }) {
  const [indice, setIndice] = useState(0);
  const n = cuentas.length;
  const cuenta = cuentas[indice];

  function siguiente() {
    setIndice((indice + 1) % n);
  }

  function anterior() {
    setIndice((indice - 1 + n) % n);
  }

  if (n === 0) {
    return (
      <section className="flex flex-col gap-3 min-w-0">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
          Cuentas
        </h2>
        <p>Sin cuentas</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 min-w-0">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
        Cuentas
      </h2>
      <TarjetaCuenta cuenta={cuenta}>
        {n > 1 && (
          <>
            <ul
              aria-hidden
              className="flex gap-2 absolute right-3.5 top-3 pointer-events-none"
            >
              {cuentas.map((c, i) => (
                <li key={c.cuentaId}>
                  <span
                    className={cn(
                      'block size-2 rounded-full transition-colors duration-200',
                      i === indice ? 'bg-white' : 'bg-white/40',
                    )}
                  ></span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              aria-label="Cuenta anterior"
              onClick={anterior}
              className="group/zona absolute inset-y-0 left-0 w-1/2 cursor-pointer"
            >
              <span className="absolute inset-0 flex items-center pl-2.5 bg-linear-to-r from-black/45 to-transparent to-60% opacity-0 transition-opacity duration-150 ease-(--ease-out) group-hover/zona:opacity-100 group-focus-visible/zona:opacity-100"></span>
            </button>

            <button
              type="button"
              aria-label="Cuenta siguiente"
              onClick={siguiente}
              className="group/zona absolute inset-y-0 right-0 w-1/2 cursor-pointer"
            >
              <span className="absolute inset-0 flex items-center justify-end pr-2.5 bg-linear-to-l from-black/45 to-transparent to-60% opacity-0 transition-opacity duration-150 ease-(--ease-out) group-hover/zona:opacity-100 group-focus-visible/zona:opacity-100"></span>
            </button>
          </>
        )}
      </TarjetaCuenta>
    </section>
  );
}
