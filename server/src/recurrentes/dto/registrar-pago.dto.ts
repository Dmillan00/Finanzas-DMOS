import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class RegistrarPagoDto {
  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
    allowInfinity: false,
    allowNaN: false,
  })
  @IsPositive()
  monto?: number;
}
