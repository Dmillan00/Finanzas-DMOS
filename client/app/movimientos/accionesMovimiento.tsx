'use client';
import type { Cuenta, Categoria, Movimiento } from '@/components/props';
import { useState } from 'react';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EditarMovimiento from './editarMovimiento';
import EliminarMovimiento from './eliminarMovimiento';

export default function AccionesMovimiento({
  cuentas,
  categorias,
  movimiento,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  movimiento: Movimiento;
}) {
  const [editarAbierto, setEditarAbierto] = useState(false);
  const [eliminarAbierto, setEliminarAbierto] = useState(false);

  return (
    <>
      {/* PC: los dos iconos de siempre */}
      <div className="hidden lg:flex">
        <Button
          variant={'ghost'}
          className={'text-muted-foreground'}
          size="icon-sm"
          aria-label="Editar"
          onClick={() => setEditarAbierto(true)}
        >
          <Pencil />
        </Button>
        <Button
          variant={'ghost'}
          className={'text-muted-foreground hover:text-destructive'}
          size="icon-sm"
          aria-label="Borrar"
          onClick={() => setEliminarAbierto(true)}
        >
          <Trash />
        </Button>
      </div>

      {/* Móvil: menú ⋯ */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant={'ghost'}
                className={'text-muted-foreground'}
                size="icon-sm"
                aria-label="Opciones"
              >
                <MoreVertical />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditarAbierto(true)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setEliminarAbierto(true)}
            >
              <Trash />
              Borrar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Diálogos: fuera del menú para que no se desmonten al cerrarlo */}
      <EditarMovimiento
        cuentas={cuentas}
        categorias={categorias}
        movimiento={movimiento}
        abierto={editarAbierto}
        onAbiertoChange={setEditarAbierto}
      />
      <EliminarMovimiento
        movimiento={movimiento}
        abierto={eliminarAbierto}
        onAbiertoChange={setEliminarAbierto}
      />
    </>
  );
}
