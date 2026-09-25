/**
 * Enums del dominio StoreCore.
 * Cada enum corresponde a un tipo ENUM de PostgreSQL.
 * Ver docs/10-esquema-base-de-datos.md §4.
 */

/** Rol del usuario. Un ADMIN accede a todo; un CASHIER solo al POS y su caja. */
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
}

/** Unidad de medida del producto. */
export enum ProductUnit {
  UNIT = 'UNIT',
  KG = 'KG',
  LT = 'LT',
}

/**
 * Tipo de movimiento de stock.
 * La cantidad siempre es positiva; el signo lo define este enum.
 */
export enum StockMovementType {
  /** Entrada por recepción de compra o ajuste manual de incremento. */
  PURCHASE = 'PURCHASE',
  /** Salida por venta. */
  SALE = 'SALE',
  /** Entrada por anulación de venta: devuelve el stock. */
  RETURN = 'RETURN',
  /** Corrección por diferencia de conteo físico. Puede ser positiva o negativa. */
  ADJUSTMENT = 'ADJUSTMENT',
  /** Salida por producto dañado, vencido o consumo interno. */
  WASTE = 'WASTE',
  /** Carga inicial de stock al crear el producto. */
  INITIAL = 'INITIAL',
}

/** Estados del ciclo de vida de una orden de compra. */
export enum SupplierOrderStatus {
  DRAFT = 'DRAFT',
  ORDERED = 'ORDERED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

/** Estado de una venta. Una venta anulada nunca se borra. */
export enum SaleStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/** Método de pago de una venta. */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  CREDIT = 'CREDIT',
}

/** Tipo de movimiento en la cuenta corriente de un cliente. */
export enum CustomerTransactionType {
  /** Suma al adeudo: venta a crédito. */
  CHARGE = 'CHARGE',
  /** Resta al adeudo: abono del cliente. */
  PAYMENT = 'PAYMENT',
}

/** Estado de un turno de caja. */
export enum CashShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

/** Tipos de movimiento de stock que aumentan la existencia. */
export const INCREASING_MOVEMENT_TYPES: StockMovementType[] = [
  StockMovementType.PURCHASE,
  StockMovementType.RETURN,
  StockMovementType.INITIAL,
];

/**
 * Tipos de movimiento cuyo signo depende del valor de `quantity`.
 * ADJUSTMENT puede ser positivo o negativo según la diferencia del conteo.
 */
export const DIRECTIONAL_MOVEMENT_TYPES: StockMovementType[] = [StockMovementType.ADJUSTMENT];

/**
 * Calcula el signo que un tipo de movimiento aplica a la cantidad.
 * Devuelve -1, 0 o 1.
 */
export function movementSign(type: StockMovementType, quantity: number): -1 | 0 | 1 {
  if (quantity === 0) return 0;
  if (INCREASING_MOVEMENT_TYPES.includes(type)) return 1;
  if (type === StockMovementType.SALE || type === StockMovementType.WASTE) return -1;
  return quantity > 0 ? 1 : -1;
}
