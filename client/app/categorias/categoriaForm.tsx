'use client';

import { useActionState, useEffect } from 'react';
import { crearCategoria, editarCategoria } from './actions';
import type { Categoria } from '@/components/props';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const selectTipo = [
  { label: 'Ingreso', value: 'INGRESO' },
  { label: 'Gasto', value: 'GASTO' },
];

export default function CategoriaForm({
  categoria,
  onExito,
}: {
  categoria?: Categoria;
  onExito?: () => void;
}) {
  const accion = categoria
    ? editarCategoria.bind(null, categoria.categoriaId)
    : crearCategoria;

  const [state, formAction, pending] = useActionState(accion, {
    ok: false,
    message: '',
  });

  const textButton = categoria
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
            <FieldLabel htmlFor="nombre"> Nombre </FieldLabel>

            <Input
              name="nombre"
              type="text"
              id="nombre"
              defaultValue={categoria?.nombre ?? ''}
              placeholder="Comida"
            />
          </Field>
          <Field>
            {categoria ? (
              <p>Tipo : {categoria?.tipo}</p>
            ) : (
              <>
                <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
                <Select defaultValue={'GASTO'} items={selectTipo} name="tipo">
                  <SelectTrigger id="tipo" className="w-full">
                    <SelectValue placeholder="Elige un tipo"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectTipo.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </>
            )}
          </Field>

          <Button type="submit" disabled={pending} className={'font-bold'}>
            {textButton}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
