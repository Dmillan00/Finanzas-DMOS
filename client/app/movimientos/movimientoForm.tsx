'use client';

import { useActionState, useState, useEffect } from 'react';
import { crearMovimiento, editarMovimiento } from './actions';
import type { Cuenta, Categoria, Movimiento, Tipo } from '@/components/props';
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { formatearFecha } from '@/libs/formatos';
import { Calendar1Icon } from 'lucide-react';

export default function MovimientoForm({
  cuentas,
  categorias,
  movimiento,
  onExito,
  tipoInicial,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
  movimiento?: Movimiento;
  tipoInicial?: Tipo;
  onExito?: () => void;
}) {
  const accion = movimiento
    ? editarMovimiento.bind(null, movimiento.movimientoId)
    : crearMovimiento;

  const [state, formAction, pending] = useActionState(accion, {
    ok: false,
    message: '',
  });

  const [fecha, setFecha] = useState<Date | undefined>(() =>
    movimiento ? new Date(movimiento.fecha) : new Date(),
  );

  const [tipo, setTipo] = useState<Tipo>(
    movimiento?.tipo ?? tipoInicial ?? 'GASTO',
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

  const categoriasDelTipo = categorias.filter(
    (categoria) => categoria.tipo === tipo,
  );

  const selectTipo = [
    { label: 'Ingreso', value: 'INGRESO' },
    { label: 'Gasto', value: 'GASTO' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
  ];

  const selectCuenta = cuentas.map((cuenta) => ({
    label: cuenta.nombre,
    value: cuenta.cuentaId,
  }));

  const selectCategoria = categoriasDelTipo.map((categoria) => ({
    label: categoria.nombre,
    value: categoria.categoriaId,
  }));

  const textButton = movimiento
    ? pending
      ? 'Guardando...'
      : 'Guardar'
    : pending
      ? 'Creando...'
      : 'Crear';

  return (
    <div>
      <form action={formAction}>
        <FieldGroup className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              defaultValue={movimiento?.nombre ?? ''}
              placeholder="Mercadona"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="monto">Monto</FieldLabel>
            <Input
              id="monto"
              name="monto"
              type="number"
              step="0.01"
              placeholder="0,00€"
              defaultValue={movimiento?.monto ?? ''}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
            <Select
              items={selectTipo}

              name="tipo"
              value={tipo}
              disabled={movimiento !== undefined}
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
          </Field>

          <Field>
            <FieldLabel htmlFor="cuentaBaseId">Cuenta</FieldLabel>
            <Select
              items={selectCuenta}
              name="cuentaBaseId"
              defaultValue={movimiento?.cuentaBaseId ?? null}
            >
              <SelectTrigger id="cuentaBaseId">
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
            {tipo === 'TRANSFERENCIA' ? (
              <>
                <FieldLabel htmlFor="cuentaDestinoId">
                  Cuenta destino
                </FieldLabel>
                <Select
                  items={selectCuenta}
                  name="cuentaDestinoId"
                  defaultValue={movimiento?.cuentaDestinoId ?? null}
                >
                  <SelectTrigger id="cuentaDestinoId">
                    <SelectValue placeholder="Elige una cuenta destino" />
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
              </>
            ) : (
              <>
                <FieldLabel htmlFor="categoriaId">Categoría</FieldLabel>
                <Select
                  items={selectCategoria}
                  key={tipo}
                  name="categoriaId"
                  defaultValue={movimiento?.categoria?.categoriaId ?? null}
                >
                  <SelectTrigger id="categoriaId">
                    <SelectValue placeholder="Elige una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectCategoria.map((categoria) => (
                        <SelectItem
                          key={categoria.value}
                          value={categoria.value}
                        >
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="fecha">Fecha (Opcional)</FieldLabel>
            <Popover>
              <PopoverTrigger
                id="fecha"
                render={
                  <Button
                    className="w-full justify-start"
                    type="button"
                    variant={'outline'}
                  >
                    <Calendar1Icon />
                    {fecha
                      ? formatearFecha(fecha.toISOString())
                      : 'Elige fecha'}
                  </Button>
                }
              ></PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={setFecha}
                ></Calendar>
              </PopoverContent>
            </Popover>
            <Input
              type="hidden"
              name="fecha"
              value={fecha ? format(fecha, 'yyyy-MM-dd') : ''}
            />
          </Field>
          <Field className="col-span-3">
            <FieldLabel htmlFor="nota">Nota (Opcional)</FieldLabel>
            <Input
              id="nota"
              name="nota"
              type="text"
              defaultValue={movimiento?.nota ?? ''}
            />
          </Field>
          <Field className=" col-start-3">
            <Button type="submit" disabled={pending} className="font-bold ">
              {textButton}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
