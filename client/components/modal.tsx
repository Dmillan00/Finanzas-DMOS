// Client Component: usa hooks y APIs del navegador (<dialog>), así que tiene que ejecutarse en el cliente
'use client';

import { useEffect, useRef } from 'react';

// Forma de las props que recibe el modal
type ModalProps = {
  abierto: boolean; // el padre decide si se muestra o no
  onClose: () => void; // avisa al padre de que el modal se ha cerrado (p. ej. con Esc)
  children: React.ReactNode; // contenido que el padre mete dentro (formulario, aviso...)
};

// El modal es solo la "caja": abre, cierra y muestra lo que le pasen en children
export default function Modal({ abierto, onClose, children }: ModalProps) {
  // Referencia al <dialog> real del DOM para poder llamar a showModal() y close()
  const ref = useRef<HTMLDialogElement>(null);

  // Sincroniza el <dialog> con la prop abierto cada vez que cambia
  useEffect(() => {
    if (abierto) {
      if (!ref.current?.open) {
        ref.current?.showModal(); // abre como modal: fondo, bloquea lo de detrás, Esc cierra
      }
    } else {
      ref.current?.close();
    }
  }, [abierto]);

  return (
    // ref conecta este <dialog> con ref.current; onClose salta cuando el dialog se cierra
    <dialog className="m-auto backdrop:bg-black/50" ref={ref} onClose={onClose}>
      {children}
    </dialog>
  );
}
