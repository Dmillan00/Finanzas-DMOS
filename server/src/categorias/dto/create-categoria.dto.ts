import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPositive,
  IsNumber,
  Max,
} from 'class-validator';
import { TipoMovimientoCategoria } from '../../generated/prisma/enums.js';

export class CreateCategoriaDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsPositive()
  @IsNumber({
    maxDecimalPlaces: 2,
    allowInfinity: false,
    allowNaN: false,
  })
  @Max(99999999.99)
  limite?: number;
  @IsNotEmpty()
  @IsEnum(TipoMovimientoCategoria)
  tipo: TipoMovimientoCategoria;
}
