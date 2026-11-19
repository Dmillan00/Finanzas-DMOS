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
  deudaId: number | null;
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

export type Periodicidad = 'MENSUAL' | 'ANUAL';

export type Recurrente = {
  recurrenteId: number;
  nombre: string;
  monto: string;
  tipo: 'INGRESO' | 'GASTO';
  periodicidad: Periodicidad;
  proximaFecha: string; // ISO, medianoche UTC
  esSuscripcion: boolean;
  activo: boolean;
  deudaId: number | null;
  cuentaId: number;
  categoriaId: number;
  categoria: { categoriaId: number; nombre: string };
};

export type Deuda = {
  deudaId: number;
  nombre: string;
  montoTotal: string;
  nota: string | null;
  pagado: string;
  pendiente: string;
  porcentaje: string; // 0–100, calculado en el back
  saldada: boolean;
};

export type ResumenRecurrentes = { suscripcionesMes: string };

export type ResumenDeudas = {
  numDeudas: number;
  total: string;
  pagado: string;
  pendiente: string;
  porcentaje: string;
  cuotasMes: string;
};
