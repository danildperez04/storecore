import { ProductUnit } from '#common/enums/domain.enums.js';

export interface CreateProductInput {
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  categoryId: number;
  supplierId?: number | null;
  unit: ProductUnit;
  purchasePrice: number;
  salePrice: number;
  minStock?: number;
  /** Sucursal donde se carga el stock inicial. Omitir si no hay stock inicial. */
  branchId?: number;
  /** Cantidad de stock inicial en `branchId`. Requiere `branchId`. */
  initialStock?: number;
  /** Usuario que ejecuta la operación, para el `stock_movement` (RNF-11). */
  userId: number;
}

export interface UpdateProductInput {
  sku?: string;
  barcode?: string | null;
  name?: string;
  description?: string | null;
  categoryId?: number;
  supplierId?: number | null;
  unit?: ProductUnit;
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  isActive?: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  supplierId?: number;
  isActive?: boolean;
}

/** Forma mínima que el POS (Sprint 3) necesita para escanear/buscar un producto. */
export interface ProductAutocompleteResult {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  unit: ProductUnit;
  salePrice: string;
  quantityAvailable: string;
  isLowStock: boolean;
}
