'use client';

import type { Cuenta, Categoria } from '@/components/props';
import { useState } from 'react';
import MovimientoForm from './movimientoForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusIcon } from 'lucide-react';

export default function NuevoMovimiento({
  cuentas,
  categorias,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
}) {
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento</DialogTitle>
        </DialogHeader>
        {abierto && (
          <MovimientoForm
            cuentas={cuentas}
            categorias={categorias}
            onExito={() => setAbierto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
