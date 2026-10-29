import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TipoMovimientoCategoria } from '../../generated/prisma/enums.js';

export class CreateCategoriaDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsEnum(TipoMovimientoCategoria)
  tipo: TipoMovimientoCategoria;
}
