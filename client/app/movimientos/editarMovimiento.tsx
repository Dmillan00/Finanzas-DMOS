'use client';

import type { Cuenta, Categoria, Movimiento } from '@/components/props';
import { useState } from 'react';
import MovimientoForm from './movimientoForm';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function EditarMovimiento({
  cuentas,
  categorias,
  movimiento,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  movimiento: Movimiento;
}) {
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
      <DialogContent className="sm:max-w-2xl">
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
            onExito={() => setAbierto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
