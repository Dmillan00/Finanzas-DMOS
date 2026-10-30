import CuentaForm from './cuentaForm';

type Cuenta = {
  cuentaId: number;
  nombre: string;
  saldoInicial: string;
};

export default async function Cuentas() {
  const responseAccount = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/cuentas',
  );

  if (!responseAccount.ok) {
    throw new Error('Error al obtener las cuentas');
  }

  const cuentas: Cuenta[] = await responseAccount.json();

  return (
    <main>
      <h2>Cuentas</h2>
      <CuentaForm />
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
