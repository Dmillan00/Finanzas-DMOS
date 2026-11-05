'use client';

import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
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

export default function Navbar() {
  const path = usePathname();
  const indice = enlaces.findIndex((item) => item.href === path);

  return (
    <header className="flex items-center mx-auto w-full justify-between px-5 py-2 max-w-7xl">
      <h2 className="text-2xl">Finanzas DMOS</h2>
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
