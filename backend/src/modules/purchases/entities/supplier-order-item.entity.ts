import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SupplierOrder } from './supplier-order.entity.js';
import { Product } from '#modules/products/entities/product.entity.js';

/**
 * Renglón de una orden de compra.
 *
 * `receivedQuantity` va separada de `quantity` para permitir recepción PARCIAL:
 * se pidieron 100 y llegaron 80. La diferencia queda visible sin cancelar el
 * renglón (RF-32).
 *
 * Ref: RF-30, RF-32 — docs/10-esquema-base-de-datos.md §3.9
 */
@Entity('supplier_order_item')
@Check('ck_supplier_order_item_quantity', '"quantity" > 0')
@Check('ck_supplier_order_item_received', '"received_quantity" >= 0')
export class SupplierOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', type: 'integer' })
  orderId: number;

  @ManyToOne(() => SupplierOrder, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: SupplierOrder;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.purchaseOrderItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  /** Cantidad pedida. */
  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: string;

  /** Cantidad realmente recibida. Permite recepción parcial. */
  @Column({ name: 'received_quantity', type: 'numeric', precision: 12, scale: 3, default: 0 })
  receivedQuantity: string;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2 })
  unitCost: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;
}
