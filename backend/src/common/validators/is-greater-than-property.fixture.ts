import { IsGreaterThanProperty } from './is-greater-than-property.validator.js';

/**
 * Clase auxiliar para probar el decorador de forma aislada.
 *
 * Vive en un archivo normal (no `*.spec.ts`) porque `tsconfig.json` excluye
 * los archivos de prueba de la compilación del proyecto, y el transform de
 * Vitest no habilita decoradores de clase dentro de un `*.spec.ts` — por eso
 * el decorador se aplica aquí y la prueba solo lo importa.
 */
export class GreaterThanSample {
  purchasePrice!: unknown;

  @IsGreaterThanProperty('purchasePrice', {
    message: 'El precio de venta debe ser mayor al de compra',
  })
  salePrice!: unknown;
}
