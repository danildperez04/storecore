import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductUnit } from '#common/enums/domain.enums.js';
import { CreateProductDto } from './create-product.dto.js';

/**
 * Pruebas del DTO de creación de producto (RF-09, RF-10).
 *
 * El caso de mayor riesgo (docs/12 §3, "Catálogo") es la validación de
 * precios: el precio de venta debe ser mayor al de compra.
 */

function makeDto(overrides: Record<string, unknown> = {}): CreateProductDto {
  return plainToInstance(CreateProductDto, {
    sku: 'ABC-001',
    name: 'Coca-Cola 600ml',
    categoryId: 1,
    unit: ProductUnit.UNIT,
    purchasePrice: 10,
    salePrice: 15,
    ...overrides,
  });
}

describe('CreateProductDto', () => {
  it('acepta un producto válido', async () => {
    const errors = await validate(makeDto());
    expect(errors).toHaveLength(0);
  });

  it('rechaza un precio de venta menor o igual al de compra', async () => {
    const errors = await validate(makeDto({ purchasePrice: 10, salePrice: 10 }));
    const salePriceError = errors.find((e) => e.property === 'salePrice');

    expect(salePriceError).toBeDefined();
    expect(salePriceError?.constraints?.isGreaterThanProperty).toBe(
      'El precio de venta debe ser mayor al precio de compra',
    );
  });

  it('rechaza un SKU vacío', async () => {
    const errors = await validate(makeDto({ sku: '' }));
    expect(errors.some((e) => e.property === 'sku')).toBe(true);
  });

  it('rechaza una unidad fuera del enum', async () => {
    const errors = await validate(makeDto({ unit: 'CAJA' }));
    expect(errors.some((e) => e.property === 'unit')).toBe(true);
  });

  it('rechaza una categoría faltante', async () => {
    const dto = makeDto();
    // @ts-expect-error se prueba el caso donde el campo requerido no llega
    dto.categoryId = undefined;
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'categoryId')).toBe(true);
  });

  it('admite un proveedor nulo explícito sin convertirlo en 0', async () => {
    const dto = makeDto({ supplierId: null });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.supplierId).toBeNull();
  });
});
