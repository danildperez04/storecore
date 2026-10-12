import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ProductUnit } from '#common/enums/domain.enums.js';
import { IsGreaterThanProperty } from '#common/validators/is-greater-than-property.validator.js';

export class CreateProductDto {
  @IsString({ message: 'El SKU es obligatorio' })
  @MinLength(2, { message: 'El SKU debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El SKU no puede exceder 50 caracteres' })
  sku!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'El código de barras debe ser texto' })
  @MaxLength(50, { message: 'El código de barras no puede exceder 50 caracteres' })
  barcode?: string;

  @IsString({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(180, { message: 'El nombre no puede exceder 180 caracteres' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  description?: string;

  @Type(() => Number)
  @IsInt({ message: 'La categoría es obligatoria' })
  categoryId!: number;

  /**
   * `null` no se transforma con `@Type(() => Number)` porque `Number(null)`
   * es `0` (un id inexistente, no "sin proveedor"). Se convierte a mano para
   * distinguir "sin proveedor" de un error de tipo.
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : Number(value)))
  @ValidateIf((o: CreateProductDto) => o.supplierId !== null && o.supplierId !== undefined)
  @IsInt({ message: 'El proveedor debe ser un identificador numérico' })
  supplierId?: number | null;

  @IsEnum(ProductUnit, { message: 'La unidad debe ser UNIT, KG o LT' })
  unit!: ProductUnit;

  @Type(() => Number)
  @IsNumber({}, { message: 'El precio de compra debe ser un número' })
  @Min(0, { message: 'El precio de compra no puede ser negativo' })
  purchasePrice!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'El precio de venta debe ser un número' })
  @Min(0, { message: 'El precio de venta no puede ser negativo' })
  @IsGreaterThanProperty('purchasePrice', {
    message: 'El precio de venta debe ser mayor al precio de compra',
  })
  salePrice!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  minStock?: number;

  @ApiPropertyOptional({ description: 'Sucursal donde se carga el stock inicial (RF-13)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La sucursal debe ser un identificador numérico' })
  branchId?: number;

  @ApiPropertyOptional({ description: 'Cantidad de stock inicial en esa sucursal', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El stock inicial debe ser un número' })
  @Min(0, { message: 'El stock inicial no puede ser negativo' })
  initialStock?: number;
}
