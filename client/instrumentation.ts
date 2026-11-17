export function register() {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error('API_URL no esta definido');
  }

  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      throw new Error();
    }
  } catch {
    throw new Error('API_URL no es una URL valida: ' + url);
  }
}
