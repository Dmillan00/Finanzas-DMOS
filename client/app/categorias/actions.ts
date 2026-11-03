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
    const errorBody: unknown = await responseCategory.json().catch(() => null);

    let message = 'Error al crear la categoria';

    if (typeof errorBody === 'object' && errorBody !== null) {
      const backMessage = (errorBody as { message?: unknown }).message;

      if (typeof backMessage === 'string') {
        message = backMessage;
      } else if (Array.isArray(backMessage)) {
        message = backMessage.join(', ');
      }
    }

    return { ok: false, message };
  } else {
    revalidatePath('/movimientos');
    revalidatePath('/categorias');
    revalidatePath('/');
    return { ok: true, message: 'Categoria creada con exito!' };
  }
}

export async function editarCategoria(
  id: number,
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const nombre = formData.get('nombre');

  if (typeof nombre !== 'string') {
    return { ok: false, message: 'El tipo del nombre es incorrecto' };
  }

  if (nombre.trim() === '') {
    return { ok: false, message: 'El nombre no puede estar vacio' };
  }

  const responseCategory = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/categorias/' + id,
    {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nombre,
      }),
    },
  );

  if (!responseCategory.ok) {
    const errorBody: unknown = await responseCategory.json().catch(() => null);

    let message = 'Error al editar la categoria';

    if (typeof errorBody === 'object' && errorBody !== null) {
      const backMessage = (errorBody as { message?: unknown }).message;

      if (typeof backMessage === 'string') {
        message = backMessage;
      } else if (Array.isArray(backMessage)) {
        message = backMessage.join(', ');
      }
    }

    return { ok: false, message };
  } else {
    revalidatePath('/movimientos');
    revalidatePath('/categorias');
    revalidatePath('/');
    return { ok: true, message: 'Categoria editada con exito!' };
  }
}

export async function eliminarCategoria(id: number) {
  const responseCategory = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/categorias/' + id,
    {
      method: 'DELETE',
    },
  );

  if (!responseCategory.ok) {
    const errorBody: unknown = await responseCategory.json().catch(() => null);

    let message = 'Error al eliminar la categoria';

    if (typeof errorBody === 'object' && errorBody !== null) {
      const backMessage = (errorBody as { message?: unknown }).message;

      if (typeof backMessage === 'string') {
        message = backMessage;
      } else if (Array.isArray(backMessage)) {
        message = backMessage.join(', ');
      }
    }

    return { ok: false, message };
  } else {
    revalidatePath('/movimientos');
    revalidatePath('/categorias');
    revalidatePath('/');
    return { ok: true, message: 'Categoria eliminada con exito!' };
  }
}
