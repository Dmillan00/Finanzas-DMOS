'use client';

import { useActionState, useEffect } from 'react';
import { crearCategoria, editarCategoria } from './actions';
import type { Categoria } from '@/components/props';

export default function CategoriaForm({
  categoria,
  onExito,
}: {
  categoria?: Categoria;
  onExito?: () => void;
}) {
  const accion = categoria
    ? editarCategoria.bind(null, categoria.categoriaId)
    : crearCategoria;

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
            defaultValue={categoria?.nombre ?? ''}
          />
        </label>

        {categoria ? (
          <p>Tipo : {categoria?.tipo}</p>
        ) : (
          <div>
            <label htmlFor="tipo">Tipo</label>
            <select name="tipo" id="tipo">
              <option value="INGRESO">Ingreso</option>
              <option value="GASTO">Gasto</option>
            </select>
          </div>
        )}

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
