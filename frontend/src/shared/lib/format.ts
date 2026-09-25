/**
 * Utilidades de formato para la interfaz.
 *
 * Reglas de localizacion (RNF-13):
 *   - Montos en MXN con separador de miles y 2 decimales: $1,234.50
 *   - Fechas en formato dd/mm/aaaa
 *   - Cantidades con hasta 3 decimales, para productos por kilo o litro
 */

const MONEY_FORMAT = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const QUANTITY_FORMAT = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

/** Formatea un monto en pesos mexicanos. `formatMoney(1234.5)` → `$1,234.50` */
export function formatMoney(amount: number | string): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(value)) return MONEY_FORMAT.format(0);
  return MONEY_FORMAT.format(value);
}

/** Formatea una cantidad de producto, sin decimales si es entera. */
export function formatQuantity(quantity: number | string): string {
  const value = typeof quantity === 'string' ? Number.parseFloat(quantity) : quantity;
  if (!Number.isFinite(value)) return QUANTITY_FORMAT.format(0);
  return QUANTITY_FORMAT.format(value);
}

/** Formatea una fecha ISO como dd/mm/aaaa. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

/** Formatea una fecha con hora: dd/mm/aaaa hh:mm. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(date)} ${hours}:${minutes}`;
}

/** Convierte a número sin arrastrar ceros, para enviar a la API. */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Redondea a 2 decimales, evitando el error de coma flotante.
 * Todo calculo de dinero pasa por aqui.
 */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
