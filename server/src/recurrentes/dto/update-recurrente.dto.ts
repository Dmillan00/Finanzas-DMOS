import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRecurrenteDto } from './create-recurrente.dto.js';

export class UpdateRecurrenteDto extends PartialType(
  OmitType(CreateRecurrenteDto, ['tipo']),
) {}
