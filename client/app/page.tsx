type Cuenta = {
  cuentaId: number;
  nombre: string;
  saldoInicial: string;
};

export default async function Home() {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/cuentas');
  if (!response.ok) {
    throw new Error('Error al obtener las cuentas');
  }

  const cuentas: Cuenta[] = await response.json();

  return (
    <main>
      <h1>Cuentas</h1>
      <ul>
        {cuentas.map((cuenta) => (
          <li key={cuenta.cuentaId}>
            <p>{cuenta.nombre}</p>
            <p>{cuenta.saldoInicial}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
