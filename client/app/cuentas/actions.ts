'use server';

import { revalidatePath } from 'next/cache';

type EstadoForm = { ok: boolean; message: string };

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

  let responseAccount: Response;

  try {
    responseAccount = await fetch(process.env.API_URL + '/cuentas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nombre,
        saldoInicial: saldo,
      }),
    });
  } catch (error) {
    console.error(error);
    return { ok: false, message: `Servidor no disponible` };
  }

  if (!responseAccount.ok) {
    const errorBody: unknown = await responseAccount.json().catch(() => null);

    let message = 'Error al crear la cuenta';

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
    revalidatePath('/cuentas');
    revalidatePath('/');
    return { ok: true, message: 'Cuenta creada con exito!' };
  }
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

  let responseAccount: Response;

  try {
    responseAccount = await fetch(process.env.API_URL + '/cuentas/' + id, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nombre,
        saldoInicial: saldo,
      }),
    });
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Servidor no disponible' };
  }

  if (!responseAccount.ok) {
    const errorBody: unknown = await responseAccount.json().catch(() => null);

    let message = 'Error al editar la cuenta';

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
    revalidatePath('/cuentas');
    revalidatePath('/');
    return { ok: true, message: 'Cuenta editada con exito!' };
  }
}

export async function eliminarCuenta(id: number) {
  let responseAccount: Response;

  try {
    responseAccount = await fetch(process.env.API_URL + '/cuentas/' + id, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Servidor no disponible' };
  }

  if (!responseAccount.ok) {
    const errorBody: unknown = await responseAccount.json().catch(() => null);

    let message = 'Error al eliminar la cuenta';

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
    revalidatePath('/cuentas');
    revalidatePath('/');
    return { ok: true, message: 'Cuenta eliminada con exito!' };
  }
}
