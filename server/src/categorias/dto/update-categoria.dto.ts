import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto.js';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
