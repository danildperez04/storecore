import { describe, expect, it } from 'vitest';
import { stockLevelOf } from './stock';

/**
 * Pruebas de la clasificacion de stock.
 * Es la logica que decide si un producto se muestra como disponible, con stock
 * bajo o agotado, y que dispara la alerta de reposicion (RF-18).
 */
describe('stockLevelOf', () => {
  it('marca disponible cuando la existencia supera el minimo', () => {
    expect(stockLevelOf(50, 10)).toBe('healthy');
  });

  it('marca stock bajo cuando la existencia iguala el minimo', () => {
    // El minimo es el umbral de alerta: igualarlo ya debe avisar.
    expect(stockLevelOf(10, 10)).toBe('low');
  });

  it('marca stock bajo cuando la existencia queda por debajo del minimo', () => {
    expect(stockLevelOf(5, 10)).toBe('low');
  });

  it('marca agotado cuando no queda existencia', () => {
    expect(stockLevelOf(0, 10)).toBe('critical');
  });

  it('marca agotado tambien con existencia negativa', () => {
    // No deberia ocurrir: la base lo impide con CHECK (quantity >= 0).
    // Si aparece, es un bug grave y hay que notarlo como critico.
    expect(stockLevelOf(-1, 10)).toBe('critical');
  });

  it('devuelve desconocido ante valores no numericos', () => {
    expect(stockLevelOf(Number.NaN, 10)).toBe('unknown');
  });

  it('permite minimo cero sin marcar todo como bajo', () => {
    expect(stockLevelOf(1, 0)).toBe('healthy');
  });
});
