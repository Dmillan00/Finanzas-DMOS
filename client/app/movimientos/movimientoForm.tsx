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
import { cn } from '@/lib/utils';
import { useEsMovil } from '@/libs/useEsMovil';

// Nombres de los 3 pasos del formulario en móvil
const PASOS = ['Importe', 'Cuenta', 'Detalles'];

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

  // Móvil: el formulario va en 3 pasos. Los campos de los otros pasos se
  // ocultan con CSS (no se desmontan) para que lleguen al FormData. En PC (lg)
  // se ve todo a la vez.
  const [paso, setPaso] = useState(1);
  const esMovil = useEsMovil();
  const enPaso = (n: number) => (paso === n ? '' : 'hidden lg:flex');
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
      <form
        action={formAction}
        onKeyDown={(e) => {
          // Móvil: Intro en un campo de los pasos 1-2 pasa al siguiente paso
          // en vez de enviar el formulario (envío implícito de HTML).
          if (
            e.key === 'Enter' &&
            esMovil &&
            paso < 3 &&
            e.target instanceof HTMLInputElement
          ) {
            e.preventDefault();
            setPaso(paso + 1);
          }
        }}
      >
        {/* Móvil: pasos. Cada trozo es un botón que lleva a ese paso */}
        <nav
          aria-label="Pasos"
          className="mb-5 grid grid-cols-3 gap-1.5 lg:hidden"
        >
          {PASOS.map((nombre, i) => {
            const n = i + 1;
            return (
              <button
                key={nombre}
                type="button"
                onClick={() => setPaso(n)}
                aria-current={paso === n ? 'step' : undefined}
                className="flex min-h-11 flex-col justify-center gap-1.5 text-left"
              >
                <span
                  className={cn(
                    'h-1 w-full rounded-full',
                    n <= paso ? 'bg-primary' : 'bg-muted',
                  )}
                />
                <span
                  className={cn(
                    'text-xs',
                    paso === n ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {nombre}
                </span>
              </button>
            );
          })}
        </nav>
        <FieldGroup className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Field className={enPaso(3)}>
            <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              defaultValue={movimiento?.nombre ?? ''}
              placeholder="Mercadona"
            />
          </Field>
          <Field className={enPaso(1)}>
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
          <Field className={cn('order-first lg:order-none', enPaso(1))}>
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

          <Field className={enPaso(2)}>
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
          <Field className={enPaso(2)}>
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
          <Field className={enPaso(3)}>
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
          <Field className={cn('lg:col-span-3', enPaso(3))}>
            <FieldLabel htmlFor="nota">Nota (Opcional)</FieldLabel>
            <Input
              id="nota"
              name="nota"
              type="text"
              defaultValue={movimiento?.nota ?? ''}
            />
          </Field>
          <Field className={cn('lg:col-start-3', enPaso(3))}>
            <Button
              type="submit"
              disabled={pending}
              className="mt-2 h-12 text-base font-bold lg:mt-0 lg:h-9 lg:text-sm"
            >
              {textButton}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
