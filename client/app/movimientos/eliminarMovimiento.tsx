'use client';
import type { Movimiento } from '@/components/props';
import { useTransition, useState } from 'react';
import { eliminarMovimiento } from './actions';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { toast } from 'sonner';
import icon from 'lucide-react/icons/';

export default function EliminarMovimiento({
  movimiento,
}: {
  movimiento: Movimiento;
}) {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, startTransition] = useTransition();

  const confirmar = () => {
    startTransition(async () => {
      const resultado = await eliminarMovimiento(movimiento.movimientoId);
      if (resultado.ok) {
        toast.success(resultado.message);
        setAbierto(false);
      } else {
        toast.error(resultado.message);
      }
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <Button
            variant={'ghost'}
            className={'text-muted-foreground hover:text-destructive'}
            size="icon-sm"
          >
            <Trash></Trash>
          </Button>
        }
      />
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
