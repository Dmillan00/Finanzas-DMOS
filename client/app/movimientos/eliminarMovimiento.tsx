'use client';
import type { Movimiento } from '@/components/props';
import { eliminarMovimiento } from './actions';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { toast } from 'sonner';

export default function EliminarMovimiento({
  movimiento,
  abierto,
  onAbiertoChange,
}: {
  movimiento: Movimiento;
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
}) {
  const [pendiente, startTransition] = useTransition();

  const confirmar = () => {
    startTransition(async () => {
      const resultado = await eliminarMovimiento(movimiento.movimientoId);
      if (resultado.ok) {
        toast.success(resultado.message);
        onAbiertoChange(false);
      } else {
        toast.error(resultado.message);
      }
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar Movimiento?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer, ¿estás seguro que quieres
            eliminar: <span className="text-primary">{movimiento.nombre}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant={'outline'} type="button">
                Cerrar
              </Button>
            }
          />
          <Button
            type="button"
            variant={'destructive'}
            onClick={confirmar}
            disabled={pendiente}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
