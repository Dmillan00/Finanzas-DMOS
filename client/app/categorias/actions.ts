'use server';

import type { EstadoForm } from '@/libs/helper';
import { apiPeticiones } from '@/libs/helper';
const routes = ['/movimientos', '/categorias', '/'];

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

  return apiPeticiones({
    route: '/categorias',
    method: 'POST',
    body: {
      nombre,
      tipo,
    },
    okMsj: 'Categoria creada con exito',
    errorMsj: 'Error al crear la categoria',
    revalidate: routes,
  });
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
  return apiPeticiones({
    route: '/categorias/' + id,
    method: 'PATCH',
    body: {
      nombre,
    },
    okMsj: 'Categoria editada con exito',
    errorMsj: 'Error al editar la categoria',
    revalidate: routes,
  });
}

export async function eliminarCategoria(id: number): Promise<EstadoForm> {
  return apiPeticiones({
    route: '/categorias/' + id,
    method: 'DELETE',
    okMsj: 'Categoria eliminada con exito',
    errorMsj: 'Error al eliminar la categoria',
    revalidate: routes,
  });
}
