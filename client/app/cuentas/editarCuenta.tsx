'use client';

import type { Cuenta } from '@/components/props';
import { useState } from 'react';
import CuentaForm from './cuentaForm';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function EditarCuenta({ cuenta }: { cuenta: Cuenta }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <Button
            variant={'ghost'}
            className={'text-muted-foreground '}
            size="icon-sm"
          >
            <Pencil></Pencil>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Editar Cuenta: <span className="text-primary">{cuenta.nombre}</span>
          </DialogTitle>
        </DialogHeader>
        {abierto && (
          <CuentaForm cuenta={cuenta} onExito={() => setAbierto(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
