import type { Cuenta } from './props';
import Image from 'next/image';
import { formatearMonto } from '@/libs/formatos';
import { cn } from '@/lib/utils';

const imgs: Record<string, string> = {
  BBVA: '/cards/bbva.jpg',
  'Trade Republic': '/cards/trade-republic.png',
};

export default function TarjetaCuenta({
  cuenta,
  children,
}: {
  cuenta: Cuenta;
  children?: React.ReactNode;
}) {
  const imagen = imgs[cuenta.nombre];
  const negativo = Number(cuenta.saldoActual) < 0;
  return (
    <div className="relative aspect-[1.586] border border-white/10 overflow-hidden rounded-xl">
      {imagen ? (
        <Image
          src={imagen}
          alt={cuenta.nombre}
          fill
          sizes="33vw"
          className="object-cover"
        />
      ) : (
        <div className="bg-radial-[at_0%_0%] from-primary/40 to-primary/10 to-70% absolute inset-0">
          <div className="absolute top-[35%] left-[7%] w-8.5 h-6.5 bg-linear-to-br rounded-md border from-[#d9c27a] to-[#9c8443] opacity-85"></div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 p-3">
        <p className="text-sm text-white/80">{cuenta.nombre}</p>
        <p
          className={cn(
            'text-2xl font-semibold tabular-nums',
            negativo ? 'text-red-400' : 'text-white',
          )}
        >
          {formatearMonto(cuenta.saldoActual)}
        </p>
      </div>
      {children}
    </div>
  );
}
