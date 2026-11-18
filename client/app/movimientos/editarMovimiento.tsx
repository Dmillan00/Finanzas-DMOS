'use client';

import type { Cuenta, Categoria, Movimiento } from '@/components/props';
import MovimientoForm from './movimientoForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PANEL_MOVIL_ANCHO } from '@/libs/estilos';

export default function EditarMovimiento({
  cuentas,
  categorias,
  movimiento,
  abierto,
  onAbiertoChange,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  movimiento: Movimiento;
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
}) {
  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className={PANEL_MOVIL_ANCHO}>
        <DialogHeader>
          <DialogTitle>
            Editar Movimiento:{' '}
            <span className="text-primary">{movimiento.nombre}</span>
          </DialogTitle>
        </DialogHeader>
        {abierto && (
          <MovimientoForm
            cuentas={cuentas}
            categorias={categorias}
            movimiento={movimiento}
            onExito={() => onAbiertoChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
