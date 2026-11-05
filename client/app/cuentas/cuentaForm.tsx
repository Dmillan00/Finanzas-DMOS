'use client';

import { useActionState, useEffect } from 'react';
import { crearCuenta, editarCuenta } from './actions';
import type { Cuenta } from '@/components/props';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function CuentaForm({
  cuenta,
  onExito,
}: {
  cuenta?: Cuenta;
  onExito?: () => void;
}) {
  const accion = cuenta
    ? editarCuenta.bind(null, cuenta.cuentaId)
    : crearCuenta;

  const [state, formAction, pending] = useActionState(accion, {
    ok: false,
    message: '',
  });

  const textButton = cuenta
    ? pending
      ? 'Guardando...'
      : 'Guardar'
    : pending
      ? 'Creando...'
      : 'Crear';

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

  return (
    <div>
      <form action={formAction}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="nombre">Nombre </FieldLabel>
            <Input
              name="nombre"
              type="text"
              id="nombre"
              defaultValue={cuenta?.nombre ?? ''}
              placeholder="BBVA"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="saldoInicial">Saldo inicial</FieldLabel>
            <Input
              name="saldoInicial"
              type="number"
              step={0.01}
              id="saldoInicial"
              defaultValue={cuenta?.saldoInicial ?? 0}
            />
          </Field>

          <Button type="submit" disabled={pending} className={'font-bold'}>
            {textButton}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
