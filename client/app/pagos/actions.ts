'use server';

import { apiPeticiones } from '@/libs/helper';
import type { EstadoForm } from '@/libs/helper';

// Pagar o pausar toca movimientos, saldos, dashboard y deudas
const routes = ['/pagos', '/movimientos', '/cuentas', '/'];

type BodyRecurrente = {
  nombre: string;
  monto: number;
  tipo?: string;
  periodicidad: string;
  proximaFecha: string;
  esSuscripcion: boolean;
  cuentaId: number;
  categoriaId: number;
  deudaId?: number | null;
};

// Lee y valida los campos comunes de crear/editar recurrente
function leerRecurrente(
  formData: FormData,
): { ok: false; message: string } | { ok: true; body: BodyRecurrente } {
  const nombre = formData.get('nombre');
  const monto = Number(formData.get('monto'));
  const periodicidad = formData.get('periodicidad');
  const proximaFecha = formData.get('proximaFecha');
  const esSuscripcion = formData.get('esSuscripcion') === 'true';
  const cuentaId = Number(formData.get('cuentaId'));
  const categoriaId = Number(formData.get('categoriaId'));
  const deudaId = formData.get('deudaId');

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return { ok: false, message: 'El nombre no puede estar vacío' };
  }

  if (Number.isNaN(monto) || monto <= 0) {
    return { ok: false, message: 'Error en el formato del monto' };
  }

  if (typeof periodicidad !== 'string' || periodicidad === '') {
    return { ok: false, message: 'Debes elegir una periodicidad' };
  }

  if (typeof proximaFecha !== 'string' || proximaFecha === '') {
    return { ok: false, message: 'Debes elegir la próxima fecha' };
  }

  if (!Number.isInteger(cuentaId) || cuentaId < 1) {
    return { ok: false, message: 'Debes elegir una cuenta' };
  }

  if (!Number.isInteger(categoriaId) || categoriaId < 1) {
    return { ok: false, message: 'Debes elegir una categoría' };
  }

  const body: BodyRecurrente = {
    nombre,
    monto,
    periodicidad,
    proximaFecha,
    esSuscripcion,
    cuentaId,
    categoriaId,
  };

  // El select de deuda solo existe en GASTO; 'ninguna' = sin deuda
  if (typeof deudaId === 'string') {
    body.deudaId = deudaId === 'ninguna' ? null : Number(deudaId);
  }

  return { ok: true, body };
}

export async function crearRecurrente(
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const tipo = formData.get('tipo');
  if (typeof tipo !== 'string') {
    return { ok: false, message: 'Debes elegir un tipo' };
  }

  const leido = leerRecurrente(formData);
  if (!leido.ok) {
    return leido;
  }

  // En crear, null no aporta nada: se omite
  const body = { ...leido.body, tipo };
  if (body.deudaId === null) {
    delete body.deudaId;
  }

  return apiPeticiones({
    route: '/recurrentes',
    method: 'POST',
    body,
    okMsj: 'Recurrente creado con exito',
    errorMsj: 'Error al crear el recurrente',
    revalidate: routes,
  });
}

export async function editarRecurrente(
  id: number,
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const leido = leerRecurrente(formData);
  if (!leido.ok) {
    return leido;
  }

  return apiPeticiones({
    route: '/recurrentes/' + id,
    method: 'PATCH',
    body: leido.body,
    okMsj: 'Recurrente editado con exito',
    errorMsj: 'Error al editar el recurrente',
    revalidate: routes,
  });
}

export async function eliminarRecurrente(id: number): Promise<EstadoForm> {
  return apiPeticiones({
    route: '/recurrentes/' + id,
    method: 'DELETE',
    okMsj: 'Recurrente eliminado con exito',
    errorMsj: 'Error al eliminar el recurrente',
    revalidate: routes,
  });
}

// Botón Pagar/Cobrar: el monto es editable (nómina variable)
export async function pagarRecurrente(
  id: number,
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const monto = Number(formData.get('monto'));

  if (Number.isNaN(monto) || monto <= 0) {
    return { ok: false, message: 'Error en el formato del monto' };
  }

  return apiPeticiones({
    route: '/recurrentes/' + id + '/registrarPago',
    method: 'POST',
    body: { monto },
    okMsj: 'Pago registrado',
    errorMsj: 'Error al registrar el pago',
    revalidate: routes,
  });
}

export async function pausarRecurrente(id: number): Promise<EstadoForm> {
  return apiPeticiones({
    route: '/recurrentes/' + id,
    method: 'PATCH',
    body: { activo: false },
    okMsj: 'Recurrente pausado',
    errorMsj: 'Error al pausar el recurrente',
    revalidate: routes,
  });
}

// Reactivar pide la próxima fecha: la guardada puede haberse quedado atrás
export async function reactivarRecurrente(
  id: number,
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const proximaFecha = formData.get('proximaFecha');

  if (typeof proximaFecha !== 'string' || proximaFecha === '') {
    return { ok: false, message: 'Debes elegir la próxima fecha' };
  }

  return apiPeticiones({
    route: '/recurrentes/' + id,
    method: 'PATCH',
    body: { activo: true, proximaFecha },
    okMsj: 'Recurrente reactivado',
    errorMsj: 'Error al reactivar el recurrente',
    revalidate: routes,
  });
}

export async function crearDeuda(
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const nombre = formData.get('nombre');
  const montoTotal = Number(formData.get('montoTotal'));
  const nota = formData.get('nota');

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return { ok: false, message: 'El nombre no puede estar vacío' };
  }

  if (Number.isNaN(montoTotal) || montoTotal <= 0) {
    return { ok: false, message: 'Error en el formato del importe total' };
  }

  const body: { nombre: string; montoTotal: number; nota?: string } = {
    nombre,
    montoTotal,
  };

  if (typeof nota === 'string' && nota.length > 0) {
    body.nota = nota;
  }

  return apiPeticiones({
    route: '/deudas',
    method: 'POST',
    body,
    okMsj: 'Deuda creada con exito',
    errorMsj: 'Error al crear la deuda',
    revalidate: routes,
  });
}

export async function editarDeuda(
  id: number,
  estadoPrevio: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const nombre = formData.get('nombre');
  const montoTotal = Number(formData.get('montoTotal'));
  const nota = formData.get('nota');

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return { ok: false, message: 'El nombre no puede estar vacío' };
  }

  if (Number.isNaN(montoTotal) || montoTotal <= 0) {
    return { ok: false, message: 'Error en el formato del importe total' };
  }

  return apiPeticiones({
    route: '/deudas/' + id,
    method: 'PATCH',
    // Nota vaciada = null, como en movimientos
    body: {
      nombre,
      montoTotal,
      nota: typeof nota === 'string' && nota.length > 0 ? nota : null,
    },
    okMsj: 'Deuda editada con exito',
    errorMsj: 'Error al editar la deuda',
    revalidate: routes,
  });
}

export async function eliminarDeuda(id: number): Promise<EstadoForm> {
  return apiPeticiones({
    route: '/deudas/' + id,
    method: 'DELETE',
    okMsj: 'Deuda eliminada con exito',
    errorMsj: 'Error al eliminar la deuda',
    revalidate: routes,
  });
}
