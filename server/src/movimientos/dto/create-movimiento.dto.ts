import { TipoMovimiento } from '../../generated/prisma/enums.js';

export class CreateMovimientoDto {
  nombre: string;
  monto: number;
  tipo: TipoMovimiento;
  fecha?: string;
  nota?: string;
  cuentaBaseId: number;
  cuentaDestinoId?: number;
}
