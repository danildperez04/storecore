import { Category } from '#modules/categories/entities/category.entity.js';
import { Supplier } from '#modules/suppliers/entities/supplier.entity.js';
import { Product } from '#modules/products/entities/product.entity.js';
import { ProductStock } from '#modules/products/entities/product-stock.entity.js';
import { StockMovement } from '#modules/inventory/entities/stock-movement.entity.js';
import { SupplierOrder } from '#modules/purchases/entities/supplier-order.entity.js';
import { SupplierOrderItem } from '#modules/purchases/entities/supplier-order-item.entity.js';
import { Sale } from '#modules/sales/entities/sale.entity.js';
import { SaleItem } from '#modules/sales/entities/sale-item.entity.js';
import { Customer } from '#modules/customers/entities/customer.entity.js';
import { CustomerTransaction } from '#modules/customers/entities/customer-transaction.entity.js';
import { CashShift } from '#modules/cash/entities/cash-shift.entity.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';
import { User } from '#modules/users/entities/user.entity.js';

/**
 * Las 14 entidades de StoreCore, en el orden documentado.
 * Ver docs/10-esquema-base-de-datos.md §2.
 */
export const entities = [
  Branch,
  User,
  Category,
  Supplier,
  Product,
  ProductStock,
  StockMovement,
  SupplierOrder,
  SupplierOrderItem,
  Sale,
  SaleItem,
  Customer,
  CustomerTransaction,
  CashShift,
];

export {
  Branch,
  User,
  Category,
  Supplier,
  Product,
  ProductStock,
  StockMovement,
  SupplierOrder,
  SupplierOrderItem,
  Sale,
  SaleItem,
  Customer,
  CustomerTransaction,
  CashShift,
};
