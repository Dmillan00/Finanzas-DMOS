'use client';

import type { Categoria } from '@/components/props';
import Modal from '@/components/modal';
import { useState } from 'react';
import CategoriaForm from './categoriaForm';

export default function EditarCategoria({
  categoria,
}: {
  categoria: Categoria;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setAbierto(true)}>
        Editar
      </button>

      <Modal abierto={abierto} onClose={() => setAbierto(false)}>
        {abierto && (
          <CategoriaForm
            categoria={categoria}
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
