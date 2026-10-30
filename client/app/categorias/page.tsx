type Categoria = {
  categoriaId: number;
  nombre: string;
  tipo: 'GASTO' | 'INGRESO';
};

import CategoriaForm from './categoriaForm';

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
          </li>
        ))}
      </ul>
    </main>
  );
}
