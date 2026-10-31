'use server';

import { revalidatePath } from 'next/cache';

type EstadoForm = { ok: boolean; message: string };

type BodyEditar = Omit<BodyMovimiento, 'tipo' | 'nota'> & {
  nota?: string | null;
};

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
  // Lee cada campo del form por su atributo name. formData.get() devuelve
  // string | File | null, así que todo llega como texto (o null si no viene)
  const nombre = formData.get('nombre');
  // Number() convierte el texto a número; si no es válido da NaN (se valida abajo)
  const monto = Number(formData.get('monto'));
  const tipo = formData.get('tipo');
  // El <select> manda el id como texto: se pasa a número. Vacío ('') → 0, que falla la validación
  const cuentaBaseId = Number(formData.get('cuentaBaseId'));
  // Opcionales: se dejan como texto y solo se añaden al body si vienen rellenos
  const fecha = formData.get('fecha');
  const nota = formData.get('nota');
  // Solo existe uno de los dos según el tipo: categoría (ingreso/gasto) o cuenta destino (transferencia)
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

export async function editarMovimiento(
  id: number,
  estadoPrevio: EstadoForm,
  formdata: FormData,
): Promise<EstadoForm> {
  const nombre = formdata.get('nombre');
  const monto = Number(formdata.get('monto'));
  const cuentaBaseId = Number(formdata.get('cuentaBaseId'));
  const fecha = formdata.get('fecha');
  const nota = formdata.get('nota');
  const categoriaId = formdata.get('categoriaId');
  const cuentaDestinoId = formdata.get('cuentaDestinoId');

  if (typeof nombre !== 'string') {
    return { ok: false, message: 'Nombre debe ser strings' };
  }

  if (Number(monto) <= 0 || Number.isNaN(monto)) {
    return { ok: false, message: 'Error en el formato del monto' };
  }

  if (!Number.isInteger(cuentaBaseId) || cuentaBaseId < 1) {
    return { ok: false, message: 'Debes elegir una cuenta de origen' };
  }

  const BaseEditarMovimiento: BodyEditar = {
    nombre,
    monto,
    cuentaBaseId,
  };

  if (typeof fecha === 'string' && fecha.length > 0) {
    const fechaMovimiento = new Date(fecha);

    if (Number.isNaN(fechaMovimiento.getTime())) {
      return { ok: false, message: 'Error en el formato de la fecha' };
    }

    BaseEditarMovimiento.fecha = fechaMovimiento.toISOString();
  }

  if (typeof nota === 'string') {
    if (nota.length > 0) {
      BaseEditarMovimiento.nota = nota;
    } else {
      BaseEditarMovimiento.nota = null;
    }
  } else {
  }

  if (typeof categoriaId === 'string' && categoriaId.length > 0) {
    BaseEditarMovimiento.categoriaId = Number(categoriaId);
  }

  if (typeof cuentaDestinoId === 'string' && cuentaDestinoId.length > 0) {
    const destino = Number(cuentaDestinoId);

    if (!Number.isInteger(destino) || destino < 1) {
      return { ok: false, message: 'Error en el formato de la cuenta destino' };
    }

    BaseEditarMovimiento.cuentaDestinoId = destino;
  }

  const responseMovement = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/movimientos/' + id,
    {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(BaseEditarMovimiento),
    },
  );

  if (!responseMovement.ok) {
    const errorBody: unknown = await responseMovement.json().catch(() => null);

    let message = 'Error al editar el movimiento';

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
    return { ok: true, message: 'Movimiento editado con exito!' };
  }
}
