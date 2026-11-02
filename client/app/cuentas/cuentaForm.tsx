'use client';

import { useActionState, useEffect } from 'react';
import { crearCuenta, editarCuenta } from './actions';
import type { Cuenta } from '@/components/props';

export default function CuentaForm({
  cuenta,
  onExito,
}: {
  cuenta?: Cuenta;
  onExito?: () => void;
}) {
  const accion = cuenta
    ? editarCuenta.bind(null, cuenta.cuentaId)
    : crearCuenta;

  const [state, formAction, pending] = useActionState(accion, {
    ok: false,
    message: '',
  });

  useEffect(() => {
    if (state.ok) onExito?.();
  }, [state.ok, onExito]);

  return (
    <div>
      <form action={formAction}>
        <label>
          Nombre{' '}
          <input
            name="nombre"
            type="text"
            defaultValue={cuenta?.nombre ?? ''}
          />
        </label>

        <label>
          Saldo inicial{' '}
          <input
            name="saldoInicial"
            type="number"
            step={0.01}
            defaultValue={cuenta?.saldoInicial}
          />
        </label>

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
