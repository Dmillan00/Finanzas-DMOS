'use client';

import { useActionState, useState, useEffect } from 'react';
import { crearMovimiento, editarMovimiento } from './actions';
import type { Cuenta, Categoria, Movimiento } from '@/components/props';

type Tipo = 'INGRESO' | 'GASTO' | 'TRANSFERENCIA';

export default function MovimientoForm({
  cuentas,
  categorias,
  movimiento,
  onExito,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  movimiento?: Movimiento;
  onExito?: () => void;
}) {
  const accion = movimiento
    ? editarMovimiento.bind(null, movimiento.movimientoId)
    : crearMovimiento;

  const [state, formAction, pending] = useActionState(accion, {
    ok: false,
    message: '',
  });
  const [tipo, setTipo] = useState<Tipo>(movimiento?.tipo ?? 'GASTO');
  useEffect(() => {
    if (state.ok) onExito?.();
  }, [state.ok, onExito]);

  const categoriasDelTipo = categorias.filter(
    (categoria) => categoria.tipo === tipo,
  );

  return (
    <div>
      <form action={formAction}>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          required
          type="text"
          defaultValue={movimiento?.nombre ?? ''}
        />

        <label htmlFor="monto">Monto</label>
        <input
          id="monto"
          name="monto"
          required
          type="number"
          step="0.01"
          defaultValue={movimiento?.monto ?? ''}
        />

        <label htmlFor="tipo">Tipo</label>
        <select
          id="tipo"
          name="tipo"
          value={tipo}
          disabled={movimiento !== undefined}
          onChange={(e) => setTipo(e.target.value as Tipo)}
        >
          <option value="GASTO">Gasto</option>
          <option value="INGRESO">Ingreso</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>

        <label htmlFor="cuentaBaseId">Cuenta</label>
        <select
          id="cuentaBaseId"
          name="cuentaBaseId"
          defaultValue={movimiento?.cuentaBaseId ?? ''}
        >
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
            <select
              id="cuentaDestinoId"
              name="cuentaDestinoId"
              defaultValue={movimiento?.cuentaDestinoId ?? ''}
            >
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
              defaultValue={movimiento?.categoria?.categoriaId ?? ''}
            >
              <option value="">Elige una categoría</option>
              {categoriasDelTipo.map((categoria) => (
                <option
                  key={categoria.categoriaId}
                  value={categoria.categoriaId}
                >
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="fecha">Fecha (opcional)</label>
        <input
          id="fecha"
          name="fecha"
          type="date"
          defaultValue={movimiento?.fecha.slice(0, 10) ?? ''}
        />

        <label htmlFor="nota">Nota (opcional)</label>
        <input
          id="nota"
          name="nota"
          type="text"
          defaultValue={movimiento?.nota ?? ''}
        />

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
