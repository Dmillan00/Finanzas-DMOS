import { revalidatePath } from 'next/cache';

// Type de estadoForm
export type EstadoForm = { ok: boolean; message: string };

//Type de peticion
type OpcionesPeticion = {
  route: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  okMsj: string;
  errorMsj: string;
  revalidate: string[];
};

//Helper para msj de error
export async function leerMensajeError(
  res: Response,
  defaultMsg: string,
): Promise<string> {
  const body: unknown = await res.json().catch(() => null);

  if (typeof body === 'object' && body !== null) {
    const message = (body as { message?: unknown }).message;

    if (typeof message === 'string') {
      return message;
    } else if (Array.isArray(message)) {
      return message.join(', ');
    }
  }

  return defaultMsg;
}

//Helper para opciones de peticion
export async function apiPeticiones(
  opciones: OpcionesPeticion,
): Promise<EstadoForm> {
  const { route, method, body, okMsj, errorMsj, revalidate } = opciones;

  const config: RequestInit = { method };

  if (body !== undefined) {
    config.headers = { 'content-type': 'application/json' };
    config.body = JSON.stringify(body);
  }

  let res: Response;

  try {
    res = await fetch(process.env.API_URL + route, config);
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Servidor no disponible' };
  }

  if (!res.ok) {
    return { ok: false, message: await leerMensajeError(res, errorMsj) };
  }

  revalidate.forEach((ruta) => {
    revalidatePath(ruta);
  });

  return { ok: true, message: okMsj };
}
