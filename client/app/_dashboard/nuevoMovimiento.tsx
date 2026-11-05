'use client';

import type { Categoria, Cuenta, Tipo } from '@/components/props';
import { useState } from 'react';
import MovimientoForm from '../movimientos/movimientoForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowDownRight, ArrowLeftRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOTONES: {
  tipo: Tipo;
  label: string;
  icono: typeof ArrowUpRight;
  clases: string;
}[] = [
  {
    tipo: 'INGRESO',
    label: 'Ingreso',
    icono: ArrowUpRight,
    clases: 'bg-green-400',
  },
  {
    tipo: 'GASTO',
    label: 'Gasto',
    icono: ArrowDownRight,
    clases: 'bg-red-400',
  },
  {
    tipo: 'TRANSFERENCIA',
    label: 'Transferir',
    icono: ArrowLeftRight,
    clases: 'bg-primary',
  },
];

export default function NuevoMovimiento({
  cuentas,
  categorias,
}: {
  cuentas: Cuenta[];
  categorias: Categoria[];
}) {
  const [tipo, setTipo] = useState<Tipo | null>(null);

  return (
    <section className="flex flex-col gap-3 border-l pl-5 min-w-0">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
        Nuevo movimiento
      </h2>

      <div className="flex-1 flex items-center justify-around">
        {BOTONES.map((boton) => {
          const Icono = boton.icono;
          return (
            <button
              key={boton.tipo}
              type="button"
              onClick={() => setTipo(boton.tipo)}
              className="flex flex-col items-center gap-2 text-sm transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]"
            >
              <span
                className={cn(
                  'size-15 rounded-full text-primary-foreground flex items-center justify-center',
                  boton.clases,
                )}
              >
                <Icono />
              </span>
              {boton.label}
            </button>
          );
        })}
      </div>

      <Dialog
        open={tipo !== null}
        onOpenChange={(abierto) => {
          if (!abierto) {
            setTipo(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento</DialogTitle>
          </DialogHeader>
          {tipo && (
            <MovimientoForm
              cuentas={cuentas}
              categorias={categorias}
              tipoInicial={tipo}
              onExito={() => setTipo(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
