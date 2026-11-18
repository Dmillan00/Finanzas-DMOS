import { useSyncExternalStore } from 'react';

// true si la ventana mide menos que el breakpoint lg de Tailwind (64rem).
// Para lo que no se puede resolver con clases (props de Recharts, teclado...).
const CONSULTA = '(min-width: 64rem)';

function subscribe(callback: () => void) {
  const lista = window.matchMedia(CONSULTA);
  lista.addEventListener('change', callback);
  return () => lista.removeEventListener('change', callback);
}

function getSnapshot() {
  return !window.matchMedia(CONSULTA).matches;
}

// En el servidor no hay window: se asume PC
function getServerSnapshot() {
  return false;
}

export function useEsMovil() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
