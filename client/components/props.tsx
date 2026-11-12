export type Cuenta = {
  cuentaId: number;
  nombre: string;
  saldoInicial: string;
  saldoActual: string;
};

export type Categoria = {
  categoriaId: number;
  nombre: string;
  tipo: 'INGRESO' | 'GASTO';
  limite: string | null;
};

export type Movimiento = {
  movimientoId: number;
  nombre: string;
  monto: string;
  tipo: 'INGRESO' | 'GASTO' | 'TRANSFERENCIA';
  fecha: string;
  nota: string | null;
  cuentaBaseId: number;
  cuentaDestinoId: number | null;
  categoria: { categoriaId: number; nombre: string } | null;
};

export type Dashboard = {
  periodo: { desde: string; hasta: string }; // Llega como ISO
  totales: { ingresos: string; gastos: string; queda: string };
  ultimos: UltimoMovimiento[];
  gastosPorCategoria: { periodo: GastoCategoria[]; anio: GastoCategoria[] };
};

export type UltimoMovimiento = {
  movimientoId: number;
  nombre: string;
  monto: string;
  tipo: 'INGRESO' | 'GASTO';
  categoria: { nombre: string } | null;
};

export type Tipo = 'INGRESO' | 'GASTO' | 'TRANSFERENCIA';

export type GastoCategoria = {
  categoriaId: number;
  nombre: string;
  importe: string;
  limite: string | null;
  dentro: string | null;
  restante: string | null;
  exceso: string | null;
  porcentaje: string | null;
};
