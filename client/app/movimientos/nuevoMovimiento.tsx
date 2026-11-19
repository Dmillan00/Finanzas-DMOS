'use client';

import type { Cuenta, Categoria, Deuda } from '@/components/props';
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
import { PANEL_MOVIL_ANCHO } from '@/libs/estilos';

export default function NuevoMovimiento({
  cuentas,
  categorias,
  deudas,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  deudas?: Deuda[];
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
      <DialogContent className={PANEL_MOVIL_ANCHO}>
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento</DialogTitle>
        </DialogHeader>
        {abierto && (
          <MovimientoForm
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
