'use client';
import { Categoria } from '@/components/props';
import { useTransition, useState } from 'react';
import Modal from '@/components/modal';
import { eliminarCategoria } from './actions';

export default function EliminarCategoria({
  categoria,
}: {
  categoria: Categoria;
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const confirmar = () => {
    startTransition(async () => {
      const resultado = await eliminarCategoria(categoria.categoriaId);
      if (resultado.ok) {
        setAbierto(false);
      } else {
        setError(resultado.message);
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setAbierto(true);
        }}
      >
        Eliminar
      </button>

      <Modal abierto={abierto} onClose={() => setAbierto(false)}>
        {abierto && (
          <div>
            <p>Eliminar {categoria.nombre}?</p>
            {error && <p>{error}</p>}
            <button type="button" onClick={confirmar} disabled={pendiente}>
              Confirmar
            </button>
            <button type="button" onClick={() => setAbierto(false)}>
              Cancelar
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
