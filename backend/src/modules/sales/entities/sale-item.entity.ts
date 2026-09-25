import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from './sale.entity.js';
import { Product } from '#modules/products/entities/product.entity.js';

/**
 * Renglón de una venta.
 *
 * `unitPrice` y `costPrice` se CONGELAN al momento de la venta. Si mañana sube
 * el precio del producto, las ventas de hoy deben seguir reportando el margen
 * que realmente se obtuvo. Sin este congelamiento, los reportes históricos se
 * reescriben solos y dejan de ser confiables (RF-47).
 *
 * Ref: RF-22, RF-23, RF-47 — docs/10-esquema-base-de-datos.md §3.11
 */
@Entity('sale_item')
@Check('ck_sale_item_quantity', '"quantity" > 0')
@Check('ck_sale_item_amounts', '"unit_price" >= 0 AND "discount" >= 0')
@Index('idx_sale_item_sale_id', ['saleId'])
@Index('idx_sale_item_product_id', ['productId'])
export class SaleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sale_id', type: 'integer' })
  saleId: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.saleItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: string;

  /** Precio de venta unitario congelado al momento de la venta. */
  @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 })
  unitPrice: string;

  /** Descuento aplicado a este renglón. */
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;

  /** Costo de compra congelado al momento de la venta, para el margen real. */
  @Column({ name: 'cost_price', type: 'numeric', precision: 12, scale: 2 })
  costPrice: string;
}
