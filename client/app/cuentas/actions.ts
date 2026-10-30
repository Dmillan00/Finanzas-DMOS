'use server';

import { revalidatePath } from 'next/cache';

type EstadoForm = { ok: boolean; message: string };

export async function crearCuenta(
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const nombre = formData.get('nombre');
  const saldoInicial = Number(formData.get('saldoInicial'));

  if (typeof nombre !== 'string') {
    return { ok: false, message: 'El tipo del nombre es incorrecto' };
  }

  if (nombre.trim() === '') {
    return { ok: false, message: 'El nombre no puede estar vacio' };
  }

  if (Number.isNaN(saldoInicial)) {
    return { ok: false, message: 'El valor del saldo no es correcto' };
  }

  const responseAccount = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/cuentas',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        nombre,
        saldoInicial,
      }),
    },
  );

  if (!responseAccount.ok) {
    return { ok: false, message: 'Error al crear la cuenta' };
  } else {
    revalidatePath('/cuentas');
    return { ok: true, message: 'Cuenta creada con exito!' };
  }
}
