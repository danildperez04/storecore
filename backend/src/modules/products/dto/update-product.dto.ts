import { OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { BOOLEAN_QUERY_MESSAGE, ToBoolean } from '#common/transformers/to-boolean.transformer.js';
import { CreateProductDto } from './create-product.dto.js';

/**
 * `branchId`/`initialStock` solo aplican al crear (RF-13): ajustar el stock de
 * un producto existente es tarea del módulo `inventory` (Sprint 2), no de este
 * formulario de edición.
 */
class UpdatableProductFieldsDto extends OmitType(CreateProductDto, [
  'branchId',
  'initialStock',
] as const) {}

export class UpdateProductDto extends PartialType(UpdatableProductFieldsDto) {
  @IsOptional()
  @ToBoolean()
  @IsBoolean({ message: BOOLEAN_QUERY_MESSAGE })
  isActive?: boolean;
}
