import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateDeudaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber({
    maxDecimalPlaces: 2,
    allowInfinity: false,
    allowNaN: false,
  })
  @IsPositive()
  montoTotal: number;

  @IsOptional()
  @IsString()
  nota?: string;
}
