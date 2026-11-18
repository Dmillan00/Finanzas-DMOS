'use client';
import { useState } from 'react';
import CategoriaForm from './categoriaForm';
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

export default function NuevaCategoria() {
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
          <DialogTitle>Nueva Categoría</DialogTitle>
        </DialogHeader>
        {abierto && <CategoriaForm onExito={() => setAbierto(false)} />}
      </DialogContent>
    </Dialog>
  );
}
