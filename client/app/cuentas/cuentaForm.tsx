'use client';

import { useActionState } from 'react';
import { crearCuenta } from './actions';

export default function CuentaForm() {
  const [state, formAction, pending] = useActionState(crearCuenta, {
    ok: false,
    message: '',
  });

  return (
    <div>
      <form action={formAction}>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" />
        <label htmlFor="saldoInicial">Saldo inicial</label>
        <input id="saldoInicial" name="saldoInicial" type="number" />
        <button type="submit" disabled={pending}>
          Enviar
        </button>
      </form>
      {state.message && (
        <p className={state.ok ? 'clase-verde' : 'clase-roja'}>
          {state.message}
        </p>
      )}
    </div>
  );
}
