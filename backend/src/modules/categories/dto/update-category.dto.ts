import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { BOOLEAN_QUERY_MESSAGE, ToBoolean } from '#common/transformers/to-boolean.transformer.js';
import { CreateCategoryDto } from './create-category.dto.js';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @ToBoolean()
  @IsBoolean({ message: BOOLEAN_QUERY_MESSAGE })
  isActive?: boolean;
}
