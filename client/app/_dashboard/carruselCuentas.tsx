'use client';

import type { Cuenta } from '@/components/props';
import { useState } from 'react';
import Image from 'next/image';
import { formatearMonto } from '@/libs/formatos';

const imgs: Record<string, string> = {
  BBVA: '/cards/bbva.jpg',
  'Trade Republic': '/cards/trade-republic.png',
};

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
  const imagen = imgs[cuenta.nombre];

  return (
    <section>
      <h2>Cuentas</h2>
      <div className="relative aspect-[1.586] overflow-hidden rounded-xl">
        {imagen ? (
          <Image
            src={imagen}
            alt={cuenta.nombre}
            fill
            sizes="33vw"
            className="object-cover"
          />
        ) : (
          <div className="bg-linear-to-b from-slate-100 to-slate-900 absolute inset-0"></div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 p-3">
          <p>{cuenta.nombre}</p>
          <p>{formatearMonto(cuenta.saldoActual)}</p>
        </div>
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
      </div>
    </section>
  );
}
