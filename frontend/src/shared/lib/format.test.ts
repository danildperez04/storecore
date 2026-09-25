import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatQuantity,
  roundMoney,
  toNumber,
} from './format';

/**
 * Pruebas de las utilidades de formato.
 * Cubren RNF-13: montos en MXN y fechas en dd/mm/aaaa.
 */
describe('formatMoney', () => {
  it('muestra el monto con simbolo de peso y dos decimales', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50');
  });

  it('muestra un centavo exacto sin perderlo', () => {
    expect(formatMoney(87.04)).toBe('$87.04');
  });

  it('muestra cero como pesos', () => {
    expect(formatMoney(0)).toBe('$0.00');
  });

  it('acepta el numero que llega como cadena desde la base de datos', () => {
    // numeric(12,2) vuelve de PostgreSQL como string.
    expect(formatMoney('1234.50')).toBe('$1,234.50');
  });

  it('devuelve cero ante un valor no numerico en vez de NaN', () => {
    expect(formatMoney('no-es-un-numero')).toBe('$0.00');
  });
});

describe('formatQuantity', () => {
  it('omite los decimales cuando la cantidad es entera', () => {
    expect(formatQuantity(12)).toBe('12');
  });

  it('respeta hasta tres decimales para producto por kilo', () => {
    expect(formatQuantity(1.525)).toBe('1.525');
  });
});

describe('formatDate', () => {
  it('muestra la fecha en formato dia/mes/anio', () => {
    // Mes de septiembre = 9, careful con el desplazamiento de zona horaria.
    expect(formatDate(new Date(2026, 8, 25))).toBe('25/09/2026');
  });

  it('completa con ceros a la izquierda', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('05/01/2026');
  });

  it('muestra un guion cuando no hay fecha', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('muestra un guion ante una fecha invalida', () => {
    expect(formatDate('fecha-invalida')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('anade la hora en formato 24 horas', () => {
    const value = new Date(2026, 8, 25, 18, 30);
    expect(formatDateTime(value)).toBe('25/09/2026 18:30');
  });
});

describe('toNumber', () => {
  it('convierte una cadena numerica', () => {
    expect(toNumber('42.5')).toBe(42.5);
  });

  it('devuelve cero ante valores vacios', () => {
    expect(toNumber('')).toBe(0);
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });
});

describe('roundMoney', () => {
  it('redondea a dos decimales', () => {
    expect(roundMoney(12.345)).toBe(12.35);
  });

  it('evita el error de coma flotante al multiplicar', () => {
    // 0.1 + 0.2 = 0.30000000000000004 en JavaScript.
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});
