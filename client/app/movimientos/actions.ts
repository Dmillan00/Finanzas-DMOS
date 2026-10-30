'use server';

import { revalidatePath } from 'next/cache';

type EstadoForm = { ok: boolean; message: string };

type BodyMovimiento = {
  nombre: string;
  monto: number;
  tipo: string;
  cuentaBaseId: number;
  categoriaId?: number;
  cuentaDestinoId?: number;
  fecha?: string;
  nota?: string;
};

export async function crearMovimiento(
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const nombre = formData.get('nombre');
  const monto = Number(formData.get('monto'));
  const tipo = formData.get('tipo');
  const cuentaBaseId = Number(formData.get('cuentaBaseId'));
  const fecha = formData.get('fecha');
  const nota = formData.get('nota');
  const categoriaId = formData.get('categoriaId');
  const cuentaDestinoId = formData.get('cuentaDestinoId');

  if (typeof nombre !== 'string' || typeof tipo !== 'string') {
    return { ok: false, message: 'Nombre y tipo deben ser strings' };
  }

  if (Number(monto) <= 0 || Number.isNaN(monto)) {
    return { ok: false, message: 'Error en el formato del monto' };
  }

  if (!Number.isInteger(cuentaBaseId) || cuentaBaseId < 1) {
    return { ok: false, message: 'Debes elegir una cuenta de origen' };
  }

  const baseDeMovimiento: BodyMovimiento = {
    nombre,
    monto,
    tipo,
    cuentaBaseId,
  };

  if (typeof fecha === 'string' && fecha.length > 0) {
    const fechaMovimiento = new Date(fecha);

    if (Number.isNaN(fechaMovimiento.getTime())) {
      return { ok: false, message: 'Error en el formato de la fecha' };
    }

    baseDeMovimiento.fecha = fechaMovimiento.toISOString();
  }

  if (typeof nota === 'string' && nota.length > 0) {
    baseDeMovimiento.nota = nota;
  }

  if (typeof categoriaId === 'string' && categoriaId.length > 0) {
    baseDeMovimiento.categoriaId = Number(categoriaId);
  }

  if (typeof cuentaDestinoId === 'string' && cuentaDestinoId.length > 0) {
    const destino = Number(cuentaDestinoId);

    if (!Number.isInteger(destino) || destino < 1) {
      return { ok: false, message: 'Error en el formato de la cuenta destino' };
    }

    baseDeMovimiento.cuentaDestinoId = destino;
  }

  const responseMovement = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/movimientos',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(baseDeMovimiento),
    },
  );

  if (!responseMovement.ok) {
    const errorBody: unknown = await responseMovement.json().catch(() => null);

    let message = 'Error al crear el movimiento';

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
    return { ok: true, message: 'Movimiento creado con exito!' };
  }
}
