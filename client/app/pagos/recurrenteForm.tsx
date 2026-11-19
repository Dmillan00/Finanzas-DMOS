'use client';

import { useActionState, useEffect, useState } from 'react';
import { crearRecurrente, editarRecurrente } from './actions';
import type { Categoria, Cuenta, Deuda, Recurrente } from '@/components/props';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import SelectorFecha from './selectorFecha';

const selectTipo = [
  { label: 'Gasto', value: 'GASTO' },
  { label: 'Ingreso', value: 'INGRESO' },
];

const selectPeriodicidad = [
  { label: 'Mensual', value: 'MENSUAL' },
  { label: 'Anual', value: 'ANUAL' },
];

export default function RecurrenteForm({
  cuentas,
  categorias,
  deudas,
  recurrente,
  onExito,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  deudas: Deuda[];
  recurrente?: Recurrente;
  onExito?: () => void;
}) {
  const accion = recurrente
    ? editarRecurrente.bind(null, recurrente.recurrenteId)
    : crearRecurrente;

  const [state, formAction, pending] = useActionState(accion, {
    ok: false,
    message: '',
  });

  const [tipo, setTipo] = useState<string>(recurrente?.tipo ?? 'GASTO');
  const [esSuscripcion, setEsSuscripcion] = useState(
    recurrente?.esSuscripcion ?? false,
  );

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

  const selectCuenta = cuentas.map((cuenta) => ({
    label: cuenta.nombre,
    value: cuenta.cuentaId,
  }));

  const selectCategoria = categorias
    .filter((categoria) => categoria.tipo === tipo)
    .map((categoria) => ({
      label: categoria.nombre,
      value: categoria.categoriaId,
    }));

  // 'ninguna' = sin deuda (en editar, desenlaza)
  const selectDeuda = [
    { label: 'Sin deuda', value: 'ninguna' },
    // Las saldadas no se ofrecen, salvo la que ya tenga enlazada
    ...deudas
      .filter(
        (deuda) => !deuda.saldada || deuda.deudaId === recurrente?.deudaId,
      )
      .map((deuda) => ({
        label: deuda.nombre,
        value: String(deuda.deudaId),
      })),
  ];

  const textButton = recurrente
    ? pending
      ? 'Guardando...'
      : 'Guardar'
    : pending
      ? 'Creando...'
      : 'Crear';

  return (
    <form action={formAction}>
      <FieldGroup className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
          <Input
            id="nombre"
            name="nombre"
            type="text"
            defaultValue={recurrente?.nombre ?? ''}
            placeholder="Netflix"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="monto">Importe</FieldLabel>
          <Input
            id="monto"
            name="monto"
            type="number"
            step="0.01"
            placeholder="0,00€"
            defaultValue={recurrente?.monto ?? ''}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
          {recurrente ? (
            <p className="text-sm text-muted-foreground">
              {recurrente.tipo === 'GASTO' ? 'Gasto' : 'Ingreso'}
            </p>
          ) : (
            <Select
              items={selectTipo}
              name="tipo"
              value={tipo}
              onValueChange={(value) => {
                if (value !== null) {
                  setTipo(value);
                }
              }}
            >
              <SelectTrigger className="w-full" id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {selectTipo.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="periodicidad">Periodicidad</FieldLabel>
          <Select
            items={selectPeriodicidad}
            name="periodicidad"
            defaultValue={recurrente?.periodicidad ?? 'MENSUAL'}
          >
            <SelectTrigger className="w-full" id="periodicidad">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {selectPeriodicidad.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="cuentaId">Cuenta</FieldLabel>
          <Select
            items={selectCuenta}
            name="cuentaId"
            defaultValue={recurrente?.cuentaId ?? null}
          >
            <SelectTrigger className="w-full" id="cuentaId">
              <SelectValue placeholder="Elige una cuenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {selectCuenta.map((cuenta) => (
                  <SelectItem key={cuenta.value} value={cuenta.value}>
                    {cuenta.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="categoriaId">Categoría</FieldLabel>
          <Select
            items={selectCategoria}
            key={tipo}
            name="categoriaId"
            defaultValue={recurrente?.categoriaId ?? null}
          >
            <SelectTrigger className="w-full" id="categoriaId">
              <SelectValue placeholder="Elige una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {selectCategoria.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="proximaFecha">Próximo pago</FieldLabel>
          <SelectorFecha
            id="proximaFecha"
            name="proximaFecha"
            inicialIso={recurrente?.proximaFecha}
          />
        </Field>
        {tipo === 'GASTO' && (
          <Field>
            <FieldLabel htmlFor="deudaId">Deuda (Opcional)</FieldLabel>
            <Select
              items={selectDeuda}
              name="deudaId"
              defaultValue={
                recurrente?.deudaId ? String(recurrente.deudaId) : 'ninguna'
              }
            >
              <SelectTrigger className="w-full" id="deudaId">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {selectDeuda.map((deuda) => (
                    <SelectItem key={deuda.value} value={deuda.value}>
                      {deuda.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        <Field orientation="horizontal" className="lg:col-span-2">
          <Checkbox
            id="esSuscripcion"
            checked={esSuscripcion}
            onCheckedChange={(checked) => setEsSuscripcion(checked === true)}
          />
          <FieldLabel htmlFor="esSuscripcion">Es una suscripción</FieldLabel>
          <input
            type="hidden"
            name="esSuscripcion"
            value={String(esSuscripcion)}
          />
        </Field>

        <Button
          type="submit"
          disabled={pending}
          className="font-bold lg:col-span-2"
        >
          {textButton}
        </Button>
      </FieldGroup>
    </form>
  );
}
