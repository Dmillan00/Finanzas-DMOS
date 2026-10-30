'use client';

import { useActionState } from 'react';
import { crearCategoria } from './actions';

export default function CategoriaForm() {
  const [state, formAction, pending] = useActionState(crearCategoria, {
    ok: false,
    message: '',
  });

  return (
    <div>
      <form action={formAction}>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" />
        <label htmlFor="tipo">Tipo</label>
        <select name="tipo" id="tipo">
          <option value="INGRESO">Ingreso</option>
          <option value="GASTO">Gasto</option>
        </select>
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
