import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCuentaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  saldoInicial: number;
}
