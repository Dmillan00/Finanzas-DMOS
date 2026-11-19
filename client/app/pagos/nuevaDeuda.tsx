'use client';

import { useState } from 'react';
import DeudaForm from './deudaForm';
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

export default function NuevaDeuda() {
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <Button variant={'default'}>
            <PlusIcon />
            Nueva
          </Button>
        }
      />
      <DialogContent className={PANEL_MOVIL}>
        <DialogHeader>
          <DialogTitle>Nueva Deuda</DialogTitle>
        </DialogHeader>
        {abierto && <DeudaForm onExito={() => setAbierto(false)} />}
      </DialogContent>
    </Dialog>
  );
}
