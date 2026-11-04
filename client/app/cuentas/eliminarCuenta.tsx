'use client';
import { Cuenta } from '@/components/props';
import { useTransition, useState } from 'react';
import { eliminarCuenta } from './actions';
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

export default function EliminarCuenta({ cuenta }: { cuenta: Cuenta }) {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, startTransition] = useTransition();

  const confirmar = () => {
    startTransition(async () => {
      const resultado = await eliminarCuenta(cuenta.cuentaId);
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
          <DialogTitle>¿Eliminar Cuenta?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer, ¿estás seguro que quieres
            eliminar: <span className="text-primary">{cuenta.nombre}</span>
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
