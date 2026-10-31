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
