'use client';

import type { Categoria } from '@/components/props';
import { useState } from 'react';
import CategoriaForm from './categoriaForm';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function EditarCategoria({
  categoria,
}: {
  categoria: Categoria;
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Editar Categoría:{' '}
            <span className="text-primary">{categoria.nombre}</span>
          </DialogTitle>
        </DialogHeader>
        {abierto && (
          <CategoriaForm
            categoria={categoria}
            onExito={() => setAbierto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
