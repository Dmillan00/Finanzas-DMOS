'use client';
import type { GastoCategoria } from '@/components/props';
import { useState } from 'react';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer } from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, ListFilterIcon } from 'lucide-react';
import {
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Rectangle,
  usePlotArea,
  ZIndexLayer,
  DefaultZIndexes,
  useXAxisScale,
  useYAxisScale,
} from 'recharts';
import type { BarShapeProps } from 'recharts';
import { formatearMonto } from '@/libs/formatos';

const config: ChartConfig = {
  dentro: { label: 'Dentro', color: 'var(--primary)' },
  exceso: { label: 'Exceso', color: 'var(--destructive)' },
};

type Barra = {
  nombre: string;
  dentro: number;
  exceso: number;
  importe: string;
  limite: number | null;
  limiteTexto: string | null;
  porcentaje: string | null;
  excesoTexto: string | null;
};

// Hueco a la derecha del gráfico para los textos (importe / límite y % o +exceso)
const ANCHO_TEXTO = 250;
// Alto de cada barra y de su pista de fondo
const GROSOR_BARRA = 22;
// Lo que sobresale la raya del límite por arriba y por abajo de la barra
const SOBRA_RAYA = 4;

// Dibuja la pista de fondo (debajo de las barras) y, encima de ellas, la raya
// del límite y los textos de cada fila. Usa las escalas del propio gráfico
// para saber dónde cae cada valor en píxeles. Las capas (zIndex) controlan
// qué queda debajo y qué encima de las barras.
function Anotaciones({ barras }: { barras: Barra[] }) {
  const escalaX = useXAxisScale();
  const escalaY = useYAxisScale();
  const area = usePlotArea();

  if (!escalaX || !escalaY || !area) {
    return null;
  }

  const derecha = area.x + area.width;

  const filas = barras.flatMap((barra) => {
    const arriba = escalaY(barra.nombre, { position: 'start' });
    const abajo = escalaY(barra.nombre, { position: 'end' });

    if (arriba === undefined || abajo === undefined) {
      return [];
    }

    return [{ barra, arriba, abajo, medio: (arriba + abajo) / 2 }];
  });

  return (
    <>
      <ZIndexLayer zIndex={DefaultZIndexes.barBackground}>
        <g>
          {filas.map(({ barra, medio }) => (
            <rect
              key={barra.nombre}
              x={area.x}
              y={medio - GROSOR_BARRA / 2}
              width={area.width}
              height={GROSOR_BARRA}
              rx={6}
              className="fill-muted"
            />
          ))}
        </g>
      </ZIndexLayer>

      <ZIndexLayer zIndex={DefaultZIndexes.label}>
        <g>
          {filas.map(({ barra, medio }) => {
            const xLimite =
              barra.limite !== null ? escalaX(barra.limite) : undefined;
            const pasado = barra.excesoTexto !== null;

            return (
              <g key={barra.nombre}>
                {xLimite !== undefined && (
                  <line
                    x1={xLimite}
                    x2={xLimite}
                    y1={medio - GROSOR_BARRA / 2 - SOBRA_RAYA}
                    y2={medio + GROSOR_BARRA / 2 + SOBRA_RAYA}
                    strokeWidth={2}
                    className="stroke-foreground"
                  />
                )}

                <text
                  x={derecha + 150}
                  y={medio}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="text-xs"
                >
                  <tspan
                    className={pasado ? 'fill-destructive' : 'fill-primary'}
                  >
                    {barra.importe}
                  </tspan>
                  {barra.limiteTexto !== null && (
                    <tspan className="fill-muted-foreground">
                      {' / ' + barra.limiteTexto}
                    </tspan>
                  )}
                </text>

                {barra.limiteTexto !== null && (
                  <text
                    x={derecha + ANCHO_TEXTO - 10}
                    y={medio}
                    textAnchor="end"
                    dominantBaseline="central"
                    className={
                      pasado
                        ? 'fill-destructive text-xs'
                        : 'fill-muted-foreground text-xs'
                    }
                  >
                    {pasado ? '+' + barra.excesoTexto : barra.porcentaje + ' %'}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </ZIndexLayer>
    </>
  );
}

// Categorías por página y % del límite a partir del cual una categoría se
// considera "cerca de pasarlo" para la selección por defecto del filtro
const POR_PAGINA = 4;

const OPCIONES_MODO = [
  { valor: 'periodo', texto: 'Mes' },
  { valor: 'anio', texto: 'Año' },
];
const UMBRAL = 80;

// Selección por defecto: las que tienen límite y están al 80 % o más (incluidas
// las que ya lo han pasado). Si ninguna cumple, todas las que tienen límite.
// Si ninguna tiene límite, todas.
function seleccionInicial(lista: GastoCategoria[]): Set<number> {
  const conLimite = lista.filter((c) => c.limite !== null);
  const cerca = conLimite.filter((c) => Number(c.porcentaje) >= UMBRAL);

  let elegidas = lista;
  if (cerca.length > 0) {
    elegidas = cerca;
  } else if (conLimite.length > 0) {
    elegidas = conLimite;
  }

  return new Set(elegidas.map((c) => c.categoriaId));
}

// Pasa una categoría del back (strings) a lo que necesita el gráfico (números)
function aBarra(dato: GastoCategoria): Barra {
  const dentro =
    dato.dentro !== null ? Number(dato.dentro) : Number(dato.importe);
  const exceso = dato.exceso !== null ? Number(dato.exceso) : 0;

  return {
    nombre: dato.nombre,
    dentro,
    exceso,
    importe: formatearMonto(dato.importe),
    limite: dato.limite !== null ? Number(dato.limite) : null,
    limiteTexto: dato.limite !== null ? formatearMonto(dato.limite) : null,
    porcentaje: dato.porcentaje,
    excesoTexto:
      dato.exceso !== null && exceso > 0 ? formatearMonto(dato.exceso) : null,
  };
}

// Forma de la barra azul: siempre redonda por la izquierda y, si no hay exceso,
// también por la derecha. Si hay exceso, el extremo derecho lo cierra la roja.
function BarraDentro({ x, y, width, height, fill, payload }: BarShapeProps) {
  const radio: number | [number, number, number, number] =
    payload.exceso > 0 ? [6, 0, 0, 6] : 6;

  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      radius={radio}
    />
  );
}

export default function GraficoGastos({
  gastosPorCategoria,
}: {
  gastosPorCategoria: {
    periodo: GastoCategoria[];
    anio: GastoCategoria[];
  };
}) {
  const [modo, setModo] = useState<'periodo' | 'anio'>('periodo');
  // La selección de categorías se comparte entre Mes y Año
  const [seleccion, setSeleccion] = useState<Set<number>>(() =>
    seleccionInicial(gastosPorCategoria.periodo),
  );
  const [pagina, setPagina] = useState(0);

  const lista = gastosPorCategoria[modo];
  const elegidas = lista.filter((c) => seleccion.has(c.categoriaId));
  const todas = elegidas.map(aBarra);

  const paginas = Math.max(1, Math.ceil(todas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas - 1);
  const barras = todas.slice(
    paginaActual * POR_PAGINA,
    (paginaActual + 1) * POR_PAGINA,
  );

  // Escala común a todas las páginas: la barra más larga o el límite más alto
  const maximo = Math.max(
    0,
    ...todas.map((b) => Math.max(b.dentro + b.exceso, b.limite ?? 0)),
  );

  const total = elegidas.reduce((suma, c) => suma + Number(c.importe), 0);
  const pasadas = elegidas.filter(
    (c) => c.exceso !== null && Number(c.exceso) > 0,
  ).length;

  function alternar(id: number) {
    const nueva = new Set(seleccion);
    if (nueva.has(id)) {
      nueva.delete(id);
    } else {
      nueva.add(id);
    }
    setSeleccion(nueva);
    setPagina(0);
  }

  function elegirTodas() {
    setSeleccion(new Set(lista.map((c) => c.categoriaId)));
    setPagina(0);
  }

  function elegirNinguna() {
    setSeleccion(new Set());
    setPagina(0);
  }

  function siguiente() {
    setPagina((paginaActual + 1) % paginas);
  }

  function anterior() {
    setPagina((paginaActual - 1 + paginas) % paginas);
  }

  return (
    <div className="w-full p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Gasto por categoría
          </p>
          <p className="text-2xl font-semibold">
            {formatearMonto(String(-total))}
            {modo === 'periodo' && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                · {pasadas} {pasadas === 1 ? 'categoría' : 'categorías'} por
                encima del límite
              </span>
            )}
          </p>
        </div>

        <ToggleGroup
          size="sm"
          className="relative gap-0 rounded-full border p-1"
          onValueChange={(valor) => {
            const nuevo = valor[0];
            if (nuevo === 'periodo' || nuevo === 'anio') {
              setModo(nuevo);
              setPagina(0);
            }
          }}
          value={[modo]}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-1 w-20 rounded-full bg-muted transition-transform duration-200 ease-in-out motion-reduce:transition-none"
            style={{ transform: `translateX(${modo === 'anio' ? 100 : 0}%)` }}
          />
          {OPCIONES_MODO.map((opcion) => (
            <ToggleGroupItem
              key={opcion.valor}
              value={opcion.valor}
              className="relative w-20 rounded-full text-muted-foreground hover:bg-transparent aria-pressed:bg-black aria-pressed:text-primary"
            >
              {opcion.texto}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <Popover>
          <PopoverTrigger
            render={
              <Button type="button" variant="outline">
                <ListFilterIcon />
                Categorías {elegidas.length}/{lista.length}
                <ChevronDownIcon />
              </Button>
            }
          ></PopoverTrigger>
          <PopoverContent align="start" className="gap-2">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={elegirTodas}
              >
                Todas
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={elegirNinguna}
              >
                Ninguna
              </Button>
            </div>
            <div className="-mx-2 max-h-60 overflow-y-auto">
              {lista.map((c) => (
                <label
                  key={c.categoriaId}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <Checkbox
                    checked={seleccion.has(c.categoriaId)}
                    onCheckedChange={() => alternar(c.categoriaId)}
                  />
                  <span className="flex-1 truncate">{c.nombre}</span>
                  <span
                    className={cn(
                      'text-xs',
                      c.exceso !== null && Number(c.exceso) > 0
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                    )}
                  >
                    {formatearMonto(c.importe)}
                  </span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {modo === 'periodo' && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-primary" />
              Dentro del límite
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-destructive" />
              Lo que te pasas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-0.5 bg-foreground" />
              Límite
            </span>
          </div>
        )}
      </div>

      {lista.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Sin gastos
        </p>
      ) : todas.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Elige alguna categoría en el filtro
        </p>
      ) : (
        <>
          <div className="relative mt-2">
            <ChartContainer config={config} className="aspect-auto h-72 w-full">
              <BarChart
                layout="vertical"
                data={barras}
                barSize={GROSOR_BARRA}
                margin={{ right: ANCHO_TEXTO }}
              >
                <XAxis type="number" domain={[0, maximo || 1]} hide />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--foreground)' }}
                  type="category"
                  width={120}
                  tickFormatter={(nombre: string) =>
                    nombre.length > 16 ? nombre.slice(0, 15) + '…' : nombre
                  }
                  dataKey="nombre"
                />
                <Bar
                  dataKey="dentro"
                  stackId="a"
                  fill="var(--color-dentro)"
                  shape={BarraDentro}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="exceso"
                  stackId="a"
                  fill="var(--color-exceso)"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                />
                <Anotaciones barras={barras} />
              </BarChart>
            </ChartContainer>

            {paginas > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Página anterior"
                  onClick={anterior}
                  className="group/zona absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                >
                  <span className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent to-40% opacity-0 transition-opacity duration-150 ease-(--ease-out) group-hover/zona:opacity-100 group-focus-visible/zona:opacity-100"></span>
                </button>
                <button
                  type="button"
                  aria-label="Página siguiente"
                  onClick={siguiente}
                  className="group/zona absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                >
                  <span className="absolute inset-0 bg-linear-to-l from-black/30 to-transparent to-40% opacity-0 transition-opacity duration-150 ease-(--ease-out) group-hover/zona:opacity-100 group-focus-visible/zona:opacity-100"></span>
                </button>
              </>
            )}
          </div>

          {paginas > 1 && (
            <ul aria-hidden className="mt-2 flex justify-center gap-2">
              {Array.from({ length: paginas }, (_, i) => (
                <li key={i}>
                  <span
                    className={cn(
                      'block size-2 rounded-full transition-colors duration-200',
                      i === paginaActual ? 'bg-foreground' : 'bg-foreground/30',
                    )}
                  ></span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
