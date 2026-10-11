import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { GreaterThanSample } from './is-greater-than-property.fixture.js';

function makeSample(purchasePrice: unknown, salePrice: unknown): GreaterThanSample {
  return Object.assign(new GreaterThanSample(), { purchasePrice, salePrice });
}

describe('IsGreaterThanProperty', () => {
  it('acepta cuando el valor es mayor que la propiedad relacionada', async () => {
    const errors = await validate(makeSample(10, 20));
    expect(errors).toHaveLength(0);
  });

  it('rechaza cuando el valor es igual a la propiedad relacionada', async () => {
    const errors = await validate(makeSample(10, 10));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isGreaterThanProperty).toBe(
      'El precio de venta debe ser mayor al de compra',
    );
  });

  it('rechaza cuando el valor es menor que la propiedad relacionada', async () => {
    const errors = await validate(makeSample(10, 5));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('no falla si la propiedad relacionada no es numérica (otro validador la reporta)', async () => {
    const errors = await validate(makeSample('no-es-numero', 20));
    expect(errors).toHaveLength(0);
  });

  it('no falla si el propio valor no es numérico (otro validador lo reporta)', async () => {
    const errors = await validate(makeSample(10, 'no-es-numero'));
    expect(errors).toHaveLength(0);
  });
});
