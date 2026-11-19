'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import type { Categoria, Cuenta, Deuda, Recurrente } from '@/components/props';
import { MoreVertical, Pause, Pencil, Play, Trash } from 'lucide-react';
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PANEL_MOVIL, PANEL_MOVIL_ANCHO } from '@/libs/estilos';
import {
  eliminarRecurrente,
  pagarRecurrente,
  pausarRecurrente,
  reactivarRecurrente,
} from './actions';
import RecurrenteForm from './recurrenteForm';
import AvisoDeuda, { seExcede } from '@/components/avisoDeuda';
import SelectorFecha from './selectorFecha';

// Pagar/Cobrar: el importe viene precargado pero se puede cambiar
// pendiente: lo que queda de su deuda (null si no tiene)
function FormPago({
  recurrente,
  pendiente,
  onExito,
}: {
  recurrente: Recurrente;
  pendiente: number | null;
  onExito: () => void;
}) {
  const [monto, setMonto] = useState(recurrente.monto);
  const excedido = seExcede(monto, pendiente);

  const [state, formAction, pending] = useActionState(
    pagarRecurrente.bind(null, recurrente.recurrenteId),
    { ok: false, message: '' },
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      toast.success(state.message);
      onExito();
    } else {
      toast.error(state.message);
    }
  }, [state, onExito]);

  const verbo = recurrente.tipo === 'INGRESO' ? 'Cobrar' : 'Pagar';

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="monto">Importe</FieldLabel>
          <Input
            id="monto"
            name="monto"
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </Field>
        <AvisoDeuda monto={monto} pendiente={pendiente} onAjustar={setMonto} />
        <Button
          type="submit"
          disabled={pending || excedido}
          className="font-bold"
        >
          {pending ? 'Guardando...' : verbo}
        </Button>
      </FieldGroup>
    </form>
  );
}

// Reactivar pide la próxima fecha: puede haberse quedado atrás
function FormReactivar({
  recurrente,
  onExito,
}: {
  recurrente: Recurrente;
  onExito: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    reactivarRecurrente.bind(null, recurrente.recurrenteId),
    { ok: false, message: '' },
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      toast.success(state.message);
      onExito();
    } else {
      toast.error(state.message);
    }
  }, [state, onExito]);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="proximaFecha">Próximo pago</FieldLabel>
          <SelectorFecha
            id="proximaFecha"
            name="proximaFecha"
            inicialIso={recurrente.proximaFecha}
          />
        </Field>
        <Button type="submit" disabled={pending} className="font-bold">
          {pending ? 'Guardando...' : 'Reactivar'}
        </Button>
      </FieldGroup>
    </form>
  );
}

export default function AccionesRecurrente({
  recurrente,
  cuentas,
  categorias,
  deudas,
}: {
  recurrente: Recurrente;
  cuentas: Cuenta[];
  categorias: Categoria[];
  deudas: Deuda[];
}) {
  const [pagarAbierto, setPagarAbierto] = useState(false);
  const [reactivarAbierto, setReactivarAbierto] = useState(false);
  const [editarAbierto, setEditarAbierto] = useState(false);
  const [eliminarAbierto, setEliminarAbierto] = useState(false);
  const [pendiente, startTransition] = useTransition();

  const verbo = recurrente.tipo === 'INGRESO' ? 'Cobrar' : 'Pagar';

  const deuda = deudas.find((d) => d.deudaId === recurrente.deudaId);
  const pendienteDeuda = deuda ? Number(deuda.pendiente) : null;

  const pausar = () => {
    startTransition(async () => {
      const resultado = await pausarRecurrente(recurrente.recurrenteId);
      if (resultado.ok) {
        toast.success(resultado.message);
      } else {
        toast.error(resultado.message);
      }
    });
  };

  const eliminar = () => {
    startTransition(async () => {
      const resultado = await eliminarRecurrente(recurrente.recurrenteId);
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
      {/* Acción principal: Pagar/Cobrar si está activo, Reactivar si no */}
      {recurrente.activo ? (
        <Button
          variant={'outline'}
          size="sm"
          className="border-primary/50 text-primary"
          onClick={() => setPagarAbierto(true)}
        >
          {verbo}
        </Button>
      ) : (
        <Button
          variant={'outline'}
          size="sm"
          onClick={() => setReactivarAbierto(true)}
        >
          <Play />
          Reactivar
        </Button>
      )}

      {/* PC: iconos */}
      <div className="hidden lg:flex">
        {recurrente.activo && (
          <Button
            variant={'ghost'}
            className={'text-muted-foreground'}
            size="icon-sm"
            aria-label="Pausar"
            title="Pausar"
            disabled={pendiente}
            onClick={pausar}
          >
            <Pause />
          </Button>
        )}
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
            {recurrente.activo && (
              <DropdownMenuItem onClick={pausar} disabled={pendiente}>
                <Pause />
                Pausar
              </DropdownMenuItem>
            )}
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
      <Dialog open={pagarAbierto} onOpenChange={setPagarAbierto}>
        <DialogContent className={PANEL_MOVIL}>
          <DialogHeader>
            <DialogTitle>
              {verbo}: <span className="text-primary">{recurrente.nombre}</span>
            </DialogTitle>
            <DialogDescription>
              Se crea el movimiento con fecha de hoy y la próxima fecha avanza
              un periodo.
            </DialogDescription>
          </DialogHeader>
          {pagarAbierto && (
            <FormPago
              recurrente={recurrente}
              pendiente={pendienteDeuda}
              onExito={() => setPagarAbierto(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reactivarAbierto} onOpenChange={setReactivarAbierto}>
        <DialogContent className={PANEL_MOVIL}>
          <DialogHeader>
            <DialogTitle>
              Reactivar:{' '}
              <span className="text-primary">{recurrente.nombre}</span>
            </DialogTitle>
            <DialogDescription>
              Revisa la próxima fecha: mientras estaba pausado puede haberse
              quedado atrás.
            </DialogDescription>
          </DialogHeader>
          {reactivarAbierto && (
            <FormReactivar
              recurrente={recurrente}
              onExito={() => setReactivarAbierto(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editarAbierto} onOpenChange={setEditarAbierto}>
        <DialogContent className={PANEL_MOVIL_ANCHO}>
          <DialogHeader>
            <DialogTitle>
              Editar Recurrente:{' '}
              <span className="text-primary">{recurrente.nombre}</span>
            </DialogTitle>
          </DialogHeader>
          {editarAbierto && (
            <RecurrenteForm
              cuentas={cuentas}
              categorias={categorias}
              deudas={deudas}
              recurrente={recurrente}
              onExito={() => setEditarAbierto(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={eliminarAbierto} onOpenChange={setEliminarAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar Recurrente?</DialogTitle>
            <DialogDescription>
              Los movimientos que ya registró se quedan. ¿Seguro que quieres
              eliminar:{' '}
              <span className="text-primary">{recurrente.nombre}</span>?
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
