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

  return (
    <header className="flex items-center justify-between px-5 py-2">
      <h2>Finanzas DMOS</h2>{' '}
      <NavigationMenu>
        <NavigationMenuList className="rounded-full border p-1">
          {enlaces.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                className="data-active:bg-muted data-active:text-primary rounded-full px-4 py-2  text-muted-foreground"
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
