import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientoDto } from './create-movimiento.dto.js';

export class UpdateMovimientoDto extends PartialType(CreateMovimientoDto) {}
