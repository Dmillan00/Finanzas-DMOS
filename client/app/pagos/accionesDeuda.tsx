'use client';

import { useState, useTransition } from 'react';
import type { Categoria, Cuenta, Deuda } from '@/components/props';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PANEL_MOVIL, PANEL_MOVIL_ANCHO } from '@/libs/estilos';
import { eliminarDeuda } from './actions';
import DeudaForm from './deudaForm';
import MovimientoForm from '../movimientos/movimientoForm';

// Añadir pago = nuevo movimiento GASTO con la deuda ya elegida.
// Se usa en la cabecera (PC) y al pie de la tarjeta (móvil).
export function AnadirPago({
  deuda,
  deudas,
  cuentas,
  categorias,
  className,
}: {
  deuda: Deuda;
  deudas: Deuda[];
  cuentas: Cuenta[];
  categorias: Categoria[];
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Button
        variant={'outline'}
        size="sm"
        className={cn('border-primary/50 text-primary', className)}
        onClick={() => setAbierto(true)}
      >
        Añadir pago
      </Button>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className={PANEL_MOVIL_ANCHO}>
          <DialogHeader>
            <DialogTitle>
              Pago de: <span className="text-primary">{deuda.nombre}</span>
            </DialogTitle>
          </DialogHeader>
          {abierto && (
            <MovimientoForm
              cuentas={cuentas}
              categorias={categorias}
              deudas={deudas}
              tipoInicial="GASTO"
              deudaInicial={deuda.deudaId}
              onExito={() => setAbierto(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AccionesDeuda({
  deuda,
  saldada,
  deudas,
  cuentas,
  categorias,
}: {
  deuda: Deuda;
  saldada: boolean;
  deudas: Deuda[];
  cuentas: Cuenta[];
  categorias: Categoria[];
}) {
  const [editarAbierto, setEditarAbierto] = useState(false);
  const [eliminarAbierto, setEliminarAbierto] = useState(false);
  const [pendiente, startTransition] = useTransition();

  const eliminar = () => {
    startTransition(async () => {
      const resultado = await eliminarDeuda(deuda.deudaId);
      if (resultado.ok) {
        toast.success(resultado.message);
        setEliminarAbierto(false);
      } else {
        toast.error(resultado.message);
      }
    });
  };

  return (
    <>
      {/* Saldada: ya no admite pagos. En móvil va abajo de la tarjeta */}
      {!saldada && (
        <AnadirPago
          deuda={deuda}
          deudas={deudas}
          cuentas={cuentas}
          categorias={categorias}
          className="hidden lg:inline-flex"
        />
      )}

      {/* PC: iconos */}
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

      <Dialog open={editarAbierto} onOpenChange={setEditarAbierto}>
        <DialogContent className={PANEL_MOVIL}>
          <DialogHeader>
            <DialogTitle>
              Editar Deuda: <span className="text-primary">{deuda.nombre}</span>
            </DialogTitle>
          </DialogHeader>
          {editarAbierto && (
            <DeudaForm deuda={deuda} onExito={() => setEditarAbierto(false)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={eliminarAbierto} onOpenChange={setEliminarAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar Deuda?</DialogTitle>
            <DialogDescription>
              Solo se puede eliminar si no tiene pagos ni recurrentes enlazados.
              ¿Seguro que quieres eliminar:{' '}
              <span className="text-primary">{deuda.nombre}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant={'outline'} type="button">
                  Cerrar
                </Button>
              }
            />
            <Button
              type="button"
              variant={'destructive'}
              onClick={eliminar}
              disabled={pendiente}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
