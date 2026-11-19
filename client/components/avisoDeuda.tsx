'use client';

import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatearMonto } from '@/libs/formatos';

// Si el pago supera lo que queda de la deuda, avisa y ofrece recortarlo.
// El formulario no deja enviar hasta que se ajuste (el back también lo bloquea).
export function seExcede(monto: string, pendiente: number | null) {
  return pendiente !== null && Number(monto) > pendiente;
}

export default function AvisoDeuda({
  monto,
  pendiente,
  onAjustar,
}: {
  monto: string;
  pendiente: number | null;
  onAjustar: (valor: string) => void;
}) {
  if (pendiente === null || !seExcede(monto, pendiente)) {
    return null;
  }

  const queda = pendiente.toFixed(2);

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300"
    >
      <TriangleAlert className="size-4 shrink-0" />
      <span className="flex-1">
        Solo quedan {formatearMonto(queda)} por pagar de esta deuda.
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onAjustar(queda)}
      >
        Ajustar a {formatearMonto(queda)}
      </Button>
    </div>
  );
}
