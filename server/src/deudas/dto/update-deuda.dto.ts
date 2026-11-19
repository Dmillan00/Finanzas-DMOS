import { PartialType } from '@nestjs/mapped-types';
import { CreateDeudaDto } from './create-deuda.dto.js';

export class UpdateDeudaDto extends PartialType(CreateDeudaDto) {}
