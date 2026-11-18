'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Texto de una fila de lista: cortado con "…" por defecto;
// al tocarlo se despliega para leerlo completo.
export default function TextoDesplegable({
  principal,
  secundario,
}: {
  principal: string;
  secundario?: string;
}) {
  const [desplegado, setDesplegado] = useState(false);
  const corte = desplegado ? 'wrap-break-word' : 'truncate';

  return (
    <button
      type="button"
      onClick={() => setDesplegado(!desplegado)}
      aria-expanded={desplegado}
      className="flex-1 min-w-0 text-left cursor-pointer"
    >
      <p className={cn('font-medium', corte)}>{principal}</p>
      {secundario && (
        <p className={cn('text-sm text-muted-foreground', corte)}>
          {secundario}
        </p>
      )}
    </button>
  );
}
