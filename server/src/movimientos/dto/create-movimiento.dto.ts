import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';
import { TipoMovimiento } from '../../generated/prisma/enums.js';

export class CreateMovimientoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber({
    maxDecimalPlaces: 2,
    allowInfinity: false,
    allowNaN: false,
  })
  @IsPositive()
  monto: number;

  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  nota?: string;

  @IsInt()
  cuentaBaseId: number;

  @IsInt()
  @IsOptional()
  cuentaDestinoId?: number;
}
