'use client';

import { useActionState, useState } from 'react';
import { crearMovimiento } from './actions';

type Tipo = 'INGRESO' | 'GASTO' | 'TRANSFERENCIA';

type Cuenta = {
  cuentaId: number;
  nombre: string;
};

type Categoria = {
  categoriaId: number;
  nombre: string;
  tipo: 'INGRESO' | 'GASTO';
};

export default function MovimientoForm({
  cuentas,
  categorias,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
}) {
  const [state, formAction, pending] = useActionState(crearMovimiento, {
    ok: false,
    message: '',
  });
  const [tipo, setTipo] = useState<Tipo>('GASTO');

  const categoriasDelTipo = categorias.filter(
    (categoria) => categoria.tipo === tipo,
  );

  return (
    <div>
      <form action={formAction}>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" />

        <label htmlFor="monto">Monto</label>
        <input id="monto" name="monto" type="number" step="0.01" />

        <label htmlFor="tipo">Tipo</label>
        <select
          id="tipo"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as Tipo)}
        >
          <option value="GASTO">Gasto</option>
          <option value="INGRESO">Ingreso</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>

        <label htmlFor="cuentaBaseId">Cuenta</label>
        <select id="cuentaBaseId" name="cuentaBaseId" defaultValue="">
          <option value="">Elige una cuenta</option>
          {cuentas.map((cuenta) => (
            <option key={cuenta.cuentaId} value={cuenta.cuentaId}>
              {cuenta.nombre}
            </option>
          ))}
        </select>

        {tipo === 'TRANSFERENCIA' ? (
          <>
            <label htmlFor="cuentaDestinoId">Cuenta destino</label>
            <select id="cuentaDestinoId" name="cuentaDestinoId" defaultValue="">
              <option value="">Elige una cuenta</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.cuentaId} value={cuenta.cuentaId}>
                  {cuenta.nombre}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label htmlFor="categoriaId">Categoría</label>
            <select
              key={tipo}
              id="categoriaId"
              name="categoriaId"
              defaultValue=""
            >
              <option value="">Elige una categoría</option>
              {categoriasDelTipo.map((categoria) => (
                <option key={categoria.categoriaId} value={categoria.categoriaId}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="fecha">Fecha (opcional)</label>
        <input id="fecha" name="fecha" type="date" />

        <label htmlFor="nota">Nota (opcional)</label>
        <input id="nota" name="nota" type="text" />

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
