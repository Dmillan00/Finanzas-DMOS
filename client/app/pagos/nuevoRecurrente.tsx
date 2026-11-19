'use client';

import { useState } from 'react';
import type { Categoria, Cuenta, Deuda } from '@/components/props';
import RecurrenteForm from './recurrenteForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';
import { PANEL_MOVIL_ANCHO } from '@/libs/estilos';

export default function NuevoRecurrente({
  cuentas,
  categorias,
  deudas,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  deudas: Deuda[];
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <Button variant={'default'}>
            <PlusIcon />
            Nuevo
          </Button>
        }
      />
      <DialogContent className={PANEL_MOVIL_ANCHO}>
        <DialogHeader>
          <DialogTitle>Nuevo Recurrente</DialogTitle>
        </DialogHeader>
        {abierto && (
          <RecurrenteForm
            cuentas={cuentas}
            categorias={categorias}
            deudas={deudas}
            onExito={() => setAbierto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
