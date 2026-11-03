'use client';

import type { Categoria, Cuenta, Tipo } from '@/components/props';
import Modal from '@/components/modal';
import { useState } from 'react';
import MovimientoForm from '../movimientos/movimientoForm';

export default function NuevoMovimiento({
  cuentas,
  categorias,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
}) {
  const [tipo, setTipo] = useState<Tipo | null>(null);

  return (
    <section>
      <h2>Nuevo movimiento</h2>

      <div>
        <button type="button" onClick={() => setTipo('INGRESO')}>
          Ingreso
        </button>
        <button type="button" onClick={() => setTipo('GASTO')}>
          Gasto
        </button>
        <button type="button" onClick={() => setTipo('TRANSFERENCIA')}>
          Transferir
        </button>

        <Modal abierto={tipo !== null} onClose={() => setTipo(null)}>
          {tipo && (
            <MovimientoForm
              cuentas={cuentas}
              categorias={categorias}
              tipoInicial={tipo}
              onExito={() => setTipo(null)}
            />
          )}
          <button type="button" onClick={() => setTipo(null)}>
            Cerrar
          </button>
        </Modal>
      </div>
    </section>
  );
}
