import { PartialType } from '@nestjs/mapped-types';
import { CreateCuentaDto } from './create-cuenta.dto.js';

export class UpdateCuentaDto extends PartialType(CreateCuentaDto) {}
