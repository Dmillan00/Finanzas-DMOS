'use server';

import { revalidatePath } from 'next/cache';

type EstadoForm = { ok: boolean; message: string };

export async function crearCategoria(
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const nombre = formData.get('nombre');
  const tipo = formData.get('tipo');

  if (typeof nombre !== 'string') {
    return { ok: false, message: 'El tipo del nombre es incorrecto' };
  }

  if (nombre.trim() === '') {
    return { ok: false, message: 'El nombre no puede estar vacio' };
  }

  if (typeof tipo !== 'string') {
    return { ok: false, message: 'El tipado no es correcto' };
  }

  const responseCategory = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/categorias',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nombre,
        tipo,
      }),
    },
  );

  if (!responseCategory.ok) {
    return { ok: false, message: 'Error al crear la categoria' };
  } else {
    revalidatePath('/categorias');
    return { ok: true, message: 'Categoria creada con exito!' };
  }
}
