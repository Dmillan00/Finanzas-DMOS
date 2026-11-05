import type { Categoria } from '@/components/props';
import EliminarCategoria from './eliminarCategoria';
import EditarCategoria from './editarCategoria';
import NuevaCategoria from './nuevaCategoria';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ESTILO_TIPO = {
  GASTO: {
    icono: ArrowDownRight,
    clases: 'bg-red-500/15 text-red-400',
  },
  INGRESO: {
    icono: ArrowUpRight,
    clases: 'bg-green-500/15 text-green-400',
  },
};

const SECCIONES = [
  { tipo: 'INGRESO', titulo: 'Ingresos' },
  { tipo: 'GASTO', titulo: 'Gastos' },
] as const;

export default async function Categorias() {
  const responseCategory = await fetch(process.env.API_URL + '/categorias');
  if (!responseCategory.ok) {
    throw new Error('Error al obtener las categorias');
  }
  const categorias: Categoria[] = await responseCategory.json();

  return (
    <main className="px-5 py-2 mx-auto w-full max-w-7xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold  text-primary">Categorías</h1>
          <span className="text-muted-foreground">
            {categorias.length} categorías
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NuevaCategoria />
        </div>
      </div>

      {categorias.length === 0 ? (
        <p className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
          Sin categorías
        </p>
      ) : (
        <div className="flex flex-col stagger  gap-6 mt-5">
          {SECCIONES.map((seccion) => {
            const lista = categorias.filter(
              (categoria) => categoria.tipo === seccion.tipo,
            );

            return (
              <section key={seccion.tipo}>
                <p className="text-sm text-muted-foreground mb-2">
                  {seccion.titulo} · {lista.length}
                </p>
                {lista.length === 0 ? (
                  <p className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
                    Sin categorías
                  </p>
                ) : (
                  <ul className="rounded-xl border divide-y overflow-hidden">
                    {lista.map((categoria) => {
                      const estilo = ESTILO_TIPO[categoria.tipo];
                      const Icono = estilo.icono;

                      return (
                        <li
                          className="flex items-center gap-4 px-4 py-3"
                          key={categoria.categoriaId}
                          style={{ backgroundColor: 'var(--card)' }}
                        >
                          <div
                            className={cn(
                              'size-10 rounded-lg flex items-center justify-center',
                              estilo.clases,
                            )}
                          >
                            <Icono></Icono>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{categoria.nombre}</p>
                          </div>

                          <EditarCategoria categoria={categoria} />
                          <EliminarCategoria categoria={categoria} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
