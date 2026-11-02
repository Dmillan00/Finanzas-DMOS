import CategoriaForm from './categoriaForm';
import { Categoria } from '@/components/props';
import EliminarCategoria from './eliminarCategoria';
import EditarCategoria from './editarCategoria';

export default async function Categorias() {
  const responseCategory = await fetch(
    process.env.NEXT_PUBLIC_API_URL + '/categorias',
  );

  if (!responseCategory.ok) {
    throw new Error('Error al obtener las categorias');
  }

  const categorias: Categoria[] = await responseCategory.json();

  return (
    <main>
      <h2>Categorias</h2>
      <CategoriaForm />
      <ul>
        {categorias.map((categoria) => (
          <li key={categoria.categoriaId}>
            <p>{categoria.nombre}</p>
            <p>{categoria.tipo}</p>
            <EditarCategoria categoria={categoria} />
            <EliminarCategoria categoria={categoria} />
          </li>
        ))}
      </ul>
    </main>
  );
}
