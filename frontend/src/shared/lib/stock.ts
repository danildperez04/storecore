/** Nivel de alerta de un producto segun su existencia y su minimo (RF-18). */
export type StockLevel = 'healthy' | 'low' | 'critical' | 'unknown';

/**
 * Traduce la existencia y el stock minimo a un nivel de alerta.
 *
 * La existencia cero se distingue del stock bajo porque la accion es distinta:
 * un producto en cero ya no se vende y hay que pedirlo hoy.
 */
export function stockLevelOf(quantity: number, minStock: number): StockLevel {
  if (!Number.isFinite(quantity) || !Number.isFinite(minStock)) return 'unknown';
  if (quantity <= 0) return 'critical';
  if (quantity <= minStock) return 'low';
  return 'healthy';
}
