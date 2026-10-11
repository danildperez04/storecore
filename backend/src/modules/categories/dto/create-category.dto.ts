import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  name!: string;

  /**
   * `null` significa "sin padre" (categoría raíz). No se usa `@Type(() => Number)`
   * porque convertiría `null` en `0` (un id válido inexistente); se transforma a mano
   * para preservar `null` y solo convertir a número los valores reales.
   */
  @ApiPropertyOptional({ description: 'Identificador de la categoría padre' })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : Number(value)))
  @ValidateIf((o: CreateCategoryDto) => o.parentId !== null && o.parentId !== undefined)
  @IsInt({ message: 'El identificador de la categoría padre debe ser un número entero' })
  parentId?: number | null;

  @ApiPropertyOptional({ description: 'Nombre del icono mostrado en la interfaz' })
  @IsOptional()
  @IsString({ message: 'El icono debe ser texto' })
  @MaxLength(50, { message: 'El icono no puede exceder 50 caracteres' })
  icon?: string;
}
