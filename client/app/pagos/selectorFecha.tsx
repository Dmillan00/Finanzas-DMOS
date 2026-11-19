'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar1Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatearPeriodo } from '@/libs/formatos';

// proximaFecha llega como medianoche UTC: se pasa a un Date local del
// mismo día para que el calendario marque el día correcto
function desdeIsoUTC(iso: string) {
  const fecha = new Date(iso);
  return new Date(
    fecha.getUTCFullYear(),
    fecha.getUTCMonth(),
    fecha.getUTCDate(),
  );
}

// Botón + calendario; manda la fecha como 'yyyy-MM-dd' en un input oculto
export default function SelectorFecha({
  id,
  name,
  inicialIso,
}: {
  id: string;
  name: string;
  inicialIso?: string;
}) {
  const [fecha, setFecha] = useState<Date | undefined>(() =>
    inicialIso ? desdeIsoUTC(inicialIso) : new Date(),
  );
  const valor = fecha ? format(fecha, 'yyyy-MM-dd') : '';

  return (
    <>
      <Popover>
        <PopoverTrigger
          id={id}
          render={
            <Button
              className="w-full justify-start"
              type="button"
              variant={'outline'}
            >
              <Calendar1Icon />
              {fecha ? formatearPeriodo(valor + 'T00:00:00Z') : 'Elige fecha'}
            </Button>
          }
        ></PopoverTrigger>
        <PopoverContent>
          <Calendar mode="single" selected={fecha} onSelect={setFecha} />
        </PopoverContent>
      </Popover>
      <Input type="hidden" name={name} value={valor} />
    </>
  );
}
