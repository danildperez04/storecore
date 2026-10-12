import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

/** Contrato fijado en Sprint 1; su consumidor real es el POS (Sprint 3). */
export class ProductAutocompleteDto {
  @IsString({ message: 'El texto de búsqueda es obligatorio' })
  @MinLength(1, { message: 'El texto de búsqueda no puede estar vacío' })
  q!: string;

  @ApiPropertyOptional({ default: 10, maximum: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(25)
  limit?: number;
}
