'use client';

import type { Cuenta } from '@/components/props';
import Modal from '@/components/modal';
import { useState } from 'react';
import CuentaForm from './cuentaForm';

export default function EditarCuenta({ cuenta }: { cuenta: Cuenta }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setAbierto(true)}>
        Editar
      </button>

      <Modal abierto={abierto} onClose={() => setAbierto(false)}>
        {abierto && (
          <CuentaForm cuenta={cuenta} onExito={() => setAbierto(false)} />
        )}
        <button type="button" onClick={() => setAbierto(false)}>
          Cerrar
        </button>
      </Modal>
    </div>
  );
}
