'use client';

import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
  Repeat,
  Tag,
} from 'lucide-react';
const enlaces: { href: string; label: string; icono: LucideIcon }[] = [
  {
    href: '/',
    label: 'Dashboard',
    icono: LayoutDashboard,
  },

  {
    href: '/cuentas',
    label: 'Cuentas',
    icono: CreditCard,
  },

  {
    href: '/movimientos',
    label: 'Movimientos',
    icono: ArrowLeftRight,
  },

  {
    href: '/categorias',
    label: 'Categorias',
    icono: Tag,
  },

  {
    href: '/pagos',
    label: 'Pagos',
    icono: Repeat,
  },
];

function estiloBd(bd: string | null) {
  if (bd === null) {
    return { texto: 'BD ?', variant: 'destructive' as const };
  }
  if (bd === 'finanzas_main') {
    return null;
  }
  return {
    texto: 'dev',
    variant: 'outline' as const,
    clases: 'border-amber-500/40 text-amber-400',
  };
}

export default function Navbar({ bd }: { bd: string | null }) {
  const path = usePathname();
  const indice = enlaces.findIndex((item) => item.href === path);
  const estilo = estiloBd(bd);
  return (
    <header className="flex items-center mx-auto w-full justify-between px-5 py-2 max-w-7xl">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl">Finanzas DMOS</h2>
        {estilo && (
          <Badge variant={estilo.variant} className={estilo.clases}>
            {estilo.texto}
          </Badge>
        )}
      </div>

      <NavigationMenu className="fixed inset-x-3 bottom-4 z-50 max-w-none lg:static lg:max-w-max">
        <NavigationMenuList className="relative rounded-full border p-1 bg-background/90 backdrop-blur-md  lg:bg-transparent lg:backdrop-blur-none w-full">
          <li
            aria-hidden="true"
            className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/5)] lg:w-32 rounded-full bg-muted transition-[transform,opacity] duration-200 ease-(--ease-in-out) motion-reduce:transition-none"
            style={{
              transform: `translateX(${Math.max(indice, 0) * 100}%)`,
              opacity: indice === -1 ? 0 : 1,
            }}
          />
          {enlaces.map((item) => {
            const Icono = item.icono;
            return (
              <NavigationMenuItem
                key={item.href}
                className="min-w-0 flex-1 lg:w-32 lg:flex-none"
              >
                <NavigationMenuLink
                  className="justify-center flex-col text-xs lg:text-sm px-1 lg:px-4 lg:flex-row rounded-full  py-2 text-muted-foreground transition-[color,transform] duration-200 ease-(--ease-out) active:scale-[0.97] data-active:text-primary"
                  render={<Link href={item.href} />}
                  active={path === item.href}
                >
                  <Icono className="size-4 lg:hidden" />
                  {/* Móvil: solo icono; el nombre se ve en la activa (y lo lee el lector de pantalla siempre) */}
                  <span
                    className={
                      path === item.href ? undefined : 'sr-only lg:not-sr-only'
                    }
                  >
                    {item.label}
                  </span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
