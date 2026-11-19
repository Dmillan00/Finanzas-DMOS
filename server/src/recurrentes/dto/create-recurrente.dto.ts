import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import {
  TipoMovimientoCategoria,
  Periodicidad,
} from '../../generated/prisma/enums.js';

export class CreateRecurrenteDto {
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

  @IsEnum(TipoMovimientoCategoria)
  tipo: TipoMovimientoCategoria;

  @IsEnum(Periodicidad)
  periodicidad: Periodicidad;

  @IsDateString()
  proximaFecha: string;

  @IsBoolean()
  @IsOptional()
  esSuscripcion?: boolean;

  @IsInt()
  cuentaId: number;

  @IsInt()
  categoriaId: number;

  @IsOptional()
  @IsInt()
  deudaId?: number;
}
