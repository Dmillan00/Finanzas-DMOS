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
import { PANEL_MOVIL } from '@/libs/estilos';

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
      <DialogContent className={PANEL_MOVIL}>
        <DialogHeader>
          <DialogTitle>Nueva Cuenta</DialogTitle>
        </DialogHeader>
        {abierto && <CuentaForm onExito={() => setAbierto(false)} />}
      </DialogContent>
    </Dialog>
  );
}
