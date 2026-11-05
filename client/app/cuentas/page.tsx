import type { Cuenta } from '@/components/props';
import EliminarCuenta from './eliminarCuenta';
import EditarCuenta from './editarCuenta';
import NuevaCuenta from './nuevaCuenta';
import TarjetaCuenta from '@/components/tarjetaCuenta';

export default async function Cuentas() {
  const responseAccount = await fetch(process.env.API_URL + '/cuentas');

  if (!responseAccount.ok) {
    throw new Error('Error al obtener las cuentas');
  }

  const cuentas: Cuenta[] = await responseAccount.json();

  return (
    <main className="px-5 py-2 mx-auto w-full max-w-7xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold  text-primary">Cuentas</h1>
          <span className="text-muted-foreground">
            {cuentas.length} cuentas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NuevaCuenta />
        </div>
      </div>

      {cuentas.length === 0 ? (
        <p className="rounded-xl border mt-5 border-dashed py-12 text-center text-muted-foreground">
          Sin cuentas
        </p>
      ) : (
        <div className="flex flex-col gap-6 ">
          <ul className="grid stagger  mt-5 gap-4  grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {cuentas.map((cuenta) => {
              return (
                <li key={cuenta.cuentaId}>
                  <TarjetaCuenta cuenta={cuenta}>
                    <div className="absolute top-2 right-2 flex rounded-lg bg-black/40">
                      <EditarCuenta cuenta={cuenta} />
                      <EliminarCuenta cuenta={cuenta} />
                    </div>
                  </TarjetaCuenta>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}
