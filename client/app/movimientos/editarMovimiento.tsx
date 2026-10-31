'use client';

import type { Cuenta, Categoria, Movimiento } from '@/components/props';
import Modal from '@/components/modal';
import { useState } from 'react';
import MovimientoForm from './movimientoForm';

export default function EditarMovimiento({
  cuentas,
  categorias,
  movimiento,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  movimiento: Movimiento;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setAbierto(true)}>
        Editar
      </button>

      <Modal abierto={abierto} onClose={() => setAbierto(false)}>
        {abierto && (
          <MovimientoForm
            cuentas={cuentas}
            categorias={categorias}
            movimiento={movimiento}
            onExito={() => setAbierto(false)}
          />
        )}
        <button type="button" onClick={() => setAbierto(false)}>
          Cerrar
        </button>
      </Modal>
    </div>
  );
}
