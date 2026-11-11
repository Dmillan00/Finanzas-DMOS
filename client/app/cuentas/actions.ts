'use server';

import { apiPeticiones } from '@/libs/helper';
import type { EstadoForm } from '@/libs/helper';

const routes = ['/movimientos', '/cuentas', '/'];

export async function crearCuenta(
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const nombre = formData.get('nombre');
  const saldoInicial = formData.get('saldoInicial');

  if (typeof nombre !== 'string') {
    return { ok: false, message: 'El tipo del nombre es incorrecto' };
  }

  if (nombre.trim() === '') {
    return { ok: false, message: 'El nombre no puede estar vacio' };
  }

  if (typeof saldoInicial !== 'string') {
    return { ok: false, message: 'El tipo del saldo inicial es incorrecto ' };
  } else if (saldoInicial.trim() == '') {
    return { ok: false, message: 'El saldo inicial no puede estar vacio' };
  }

  const saldo = Number(saldoInicial);

  if (Number.isNaN(saldo)) {
    return { ok: false, message: 'Saldo no valido' };
  }

  return apiPeticiones({
    route: '/cuentas',
    method: 'POST',
    body: {
      nombre,
      saldoInicial: saldo,
    },
    okMsj: 'Cuenta creada con exito',
    errorMsj: 'Error al crear la cuenta',
    revalidate: routes,
  });
}

export async function editarCuenta(
  id: number,
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const nombre = formData.get('nombre');
  const saldoInicial = formData.get('saldoInicial');

  if (typeof nombre !== 'string') {
    return { ok: false, message: 'El tipo del nombre es incorrecto' };
  }

  if (nombre.trim() === '') {
    return { ok: false, message: 'El nombre no puede estar vacio' };
  }

  if (typeof saldoInicial !== 'string') {
    return { ok: false, message: 'El tipo del saldo inicial es incorrecto ' };
  } else if (saldoInicial.trim() == '') {
    return { ok: false, message: 'El saldo inicial no puede estar vacio' };
  }

  const saldo = Number(saldoInicial);

  if (Number.isNaN(saldo)) {
    return { ok: false, message: 'Saldo no valido' };
  }

  return apiPeticiones({
    route: '/cuentas/' + id,
    method: 'PATCH',
    body: { nombre, saldoInicial: saldo },
    okMsj: 'Cuenta editada con exito',
    errorMsj: 'Error al editar la cuenta',
    revalidate: routes,
  });
}

export async function eliminarCuenta(id: number): Promise<EstadoForm> {
  return apiPeticiones({
    route: '/cuentas/' + id,
    method: 'DELETE',
    okMsj: 'Cuenta eliminada con exito',
    errorMsj: 'Error al eliminar la cuenta',
    revalidate: routes,
  });
}
