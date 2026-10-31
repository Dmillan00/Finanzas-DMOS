'use client';
import { Movimiento } from '@/components/props';
import { useTransition, useState } from 'react';
import Modal from '@/components/modal';
import { eliminarMovimiento } from './actions';

export default function EliminarMovimiento({
  movimiento,
}: {
  movimiento: Movimiento;
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const confirmar = () => {
    startTransition(async () => {
      const resultado = await eliminarMovimiento(movimiento.movimientoId);
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
            <p>Eliminar {movimiento.nombre}?</p>
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
