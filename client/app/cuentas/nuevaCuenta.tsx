'use client';
import { useState } from 'react';
import CuentaForm from './cuentaForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';

export default function NuevaCuenta() {
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <Button variant={'default'}>
            <PlusIcon></PlusIcon>Nuevo
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva Cuenta</DialogTitle>
        </DialogHeader>
        {abierto && <CuentaForm onExito={() => setAbierto(false)} />}
      </DialogContent>
    </Dialog>
  );
}
