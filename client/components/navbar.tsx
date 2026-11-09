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
const enlaces: { href: string; label: string }[] = [
  {
    href: '/',
    label: 'Dashboard',
  },

  {
    href: '/cuentas',
    label: 'Cuentas',
  },

  {
    href: '/movimientos',
    label: 'Movimientos',
  },

  {
    href: '/categorias',
    label: 'Categorias',
  },
];

function estiloBd(bd: string | null) {
  if (bd === null) {
    return { texto: 'BD ?', variant: 'destructive' as const };
  }
  if (bd === 'finanzas_main') {
    return { texto: 'main', variant: 'secondary' as const };
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
  const { texto, variant, clases } = estiloBd(bd);
  return (
    <header className="flex items-center mx-auto w-full justify-between px-5 py-2 max-w-7xl">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl">Finanzas DMOS</h2>
        <Badge variant={variant} className={clases}>
          {texto}
        </Badge>
      </div>

      <NavigationMenu>
        <NavigationMenuList className="relative rounded-full border p-1">
          <li
            aria-hidden="true"
            className="absolute inset-y-1 left-1 w-32 rounded-full bg-muted transition-[transform,opacity] duration-200 ease-(--ease-in-out) motion-reduce:transition-none"
            style={{
              transform: `translateX(${Math.max(indice, 0) * 100}%)`,
              opacity: indice === -1 ? 0 : 1,
            }}
          />
          {enlaces.map((item) => (
            <NavigationMenuItem key={item.href} className="w-32">
              <NavigationMenuLink
                className="justify-center rounded-full px-4 py-2 text-muted-foreground transition-[color,transform] duration-200 ease-(--ease-out) active:scale-[0.97] data-active:text-primary"
                render={<Link href={item.href} />}
                active={path === item.href}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
