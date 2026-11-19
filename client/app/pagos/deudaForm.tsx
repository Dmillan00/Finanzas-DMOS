'use client';

import { useActionState, useEffect } from 'react';
import { crearDeuda, editarDeuda } from './actions';
import type { Deuda } from '@/components/props';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DeudaForm({
  deuda,
  onExito,
}: {
  deuda?: Deuda;
  onExito?: () => void;
}) {
  const accion = deuda ? editarDeuda.bind(null, deuda.deudaId) : crearDeuda;

  const [state, formAction, pending] = useActionState(accion, {
    ok: false,
    message: '',
  });

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      toast.success(state.message);
      onExito?.();
    } else {
      toast.error(state.message);
    }
  }, [state, onExito]);

  const textButton = deuda
    ? pending
      ? 'Guardando...'
      : 'Guardar'
    : pending
      ? 'Creando...'
      : 'Crear';

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
          <Input
            id="nombre"
            name="nombre"
            type="text"
            defaultValue={deuda?.nombre ?? ''}
            placeholder="Préstamo coche"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="montoTotal">Importe total</FieldLabel>
          <Input
            id="montoTotal"
            name="montoTotal"
            type="number"
            step="0.01"
            placeholder="0,00€"
            defaultValue={deuda?.montoTotal ?? ''}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="nota">Nota (Opcional)</FieldLabel>
          <Input
            id="nota"
            name="nota"
            type="text"
            defaultValue={deuda?.nota ?? ''}
          />
        </Field>
        <Button type="submit" disabled={pending} className="font-bold">
          {textButton}
        </Button>
      </FieldGroup>
    </form>
  );
}
