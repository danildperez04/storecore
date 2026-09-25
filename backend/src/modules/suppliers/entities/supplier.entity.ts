import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// Lados inversos: solo tipos (ver Branch).
import type { Product } from '#modules/products/entities/product.entity.js';
import type { SupplierOrder } from '#modules/purchases/entities/supplier-order.entity.js';

/**
 * Proveedor de mercancía. Se desactiva, nunca se borra: sus productos y sus
 * órdenes de compra lo referencian (RN-8).
 * Ref: RF-08 — docs/10-esquema-base-de-datos.md §3.4
 */
@Entity('supplier')
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 120, nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany('Product', (product: Product) => product.supplier)
  products: Product[];

  @OneToMany('SupplierOrder', (order: SupplierOrder) => order.supplier)
  purchaseOrders: SupplierOrder[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
