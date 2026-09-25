import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductUnit } from '#common/enums/domain.enums.js';
import { Category } from '#modules/categories/entities/category.entity.js';
import { Supplier } from '#modules/suppliers/entities/supplier.entity.js';
// Lados inversos: solo tipos (ver Branch).
import type { ProductStock } from './product-stock.entity.js';
import type { StockMovement } from '#modules/inventory/entities/stock-movement.entity.js';
import type { SupplierOrderItem } from '#modules/purchases/entities/supplier-order-item.entity.js';
import type { SaleItem } from '#modules/sales/entities/sale-item.entity.js';

/**
 * Producto del catálogo.
 *
 * `purchasePrice` y `salePrice` son numeric(12,2): nunca float, para evitar
 * errores de redondeo en dinero. La restricción CHECK `sale_price > purchase_price`
 * se crea en la migración inicial (RF-10).
 *
 * Ref: RF-09 a RF-13 — docs/10-esquema-base-de-datos.md §3.5
 */
@Entity('product')
@Index('idx_product_name', ['name'])
@Index('idx_product_category_id', ['categoryId'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  /**
   * Código de barras. El índice único es parcial para permitir varios NULL
   * (hay productos sin código). Se crea en la migración inicial.
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', length: 180 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'supplier_id', type: 'integer', nullable: true })
  supplierId: number | null;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier | null;

  @Column({ type: 'enum', enum: ProductUnit, default: ProductUnit.UNIT })
  unit: ProductUnit;

  @Column({ name: 'purchase_price', type: 'numeric', precision: 12, scale: 2, default: 0 })
  purchasePrice: string;

  @Column({ name: 'sale_price', type: 'numeric', precision: 12, scale: 2, default: 0 })
  salePrice: string;

  @Column({ name: 'min_stock', type: 'numeric', precision: 12, scale: 3, default: 0 })
  minStock: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany('ProductStock', (stock: ProductStock) => stock.product)
  stocks: ProductStock[];

  @OneToMany('StockMovement', (movement: StockMovement) => movement.product)
  movements: StockMovement[];

  @OneToMany('SupplierOrderItem', (item: SupplierOrderItem) => item.product)
  purchaseOrderItems: SupplierOrderItem[];

  @OneToMany('SaleItem', (item: SaleItem) => item.product)
  saleItems: SaleItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
