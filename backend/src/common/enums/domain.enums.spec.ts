import {
  DIRECTIONAL_MOVEMENT_TYPES,
  INCREASING_MOVEMENT_TYPES,
  movementSign,
  StockMovementType,
} from './domain.enums.js';

/**
 * Pruebas de las reglas de signo de los movimientos de stock.
 *
 * `quantity` siempre se guarda positiva y el signo lo decide el tipo. Esta
 * funcion es la que traduce una cosa en la otra, asi que un error aqui
 * descuadra el inventario entero (RN-3).
 */
describe('movementSign', () => {
  it('suma la existencia en una compra', () => {
    expect(movementSign(StockMovementType.PURCHASE, 10)).toBe(1);
  });

  it('suma la existencia al devolver una venta anulada', () => {
    expect(movementSign(StockMovementType.RETURN, 3)).toBe(1);
  });

  it('suma la existencia en la carga inicial', () => {
    expect(movementSign(StockMovementType.INITIAL, 50)).toBe(1);
  });

  it('resta la existencia en una venta', () => {
    expect(movementSign(StockMovementType.SALE, 5)).toBe(-1);
  });

  it('resta la existencia en una merma', () => {
    expect(movementSign(StockMovementType.WASTE, 2)).toBe(-1);
  });

  it('un ajuste positivo suma', () => {
    expect(movementSign(StockMovementType.ADJUSTMENT, 4)).toBe(1);
  });

  it('un ajuste negativo resta', () => {
    // La cantidad se guarda positiva; el ajuste negativo se invierte aqui.
    expect(movementSign(StockMovementType.ADJUSTMENT, -4)).toBe(-1);
  });

  it('una cantidad cero no cambia la existencia', () => {
    expect(movementSign(StockMovementType.SALE, 0)).toBe(0);
  });
});

describe('grupos de movimientos', () => {
  it('incluye compra, devolucion y carga inicial entre los que suman', () => {
    expect(INCREASING_MOVEMENT_TYPES).toEqual([
      StockMovementType.PURCHASE,
      StockMovementType.RETURN,
      StockMovementType.INITIAL,
    ]);
  });

  it('el ajuste es el unico tipo con signo direccional', () => {
    expect(DIRECTIONAL_MOVEMENT_TYPES).toEqual([StockMovementType.ADJUSTMENT]);
  });
});
