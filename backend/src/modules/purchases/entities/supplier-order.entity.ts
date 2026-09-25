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
import { SupplierOrderStatus } from '#common/enums/domain.enums.js';
import { Supplier } from '#modules/suppliers/entities/supplier.entity.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';
import { User } from '#modules/users/entities/user.entity.js';
// Lado inverso: solo tipo (ver Branch).
import type { SupplierOrderItem } from './supplier-order-item.entity.js';

/**
 * Orden de compra a proveedor.
 *
 * Ciclo de vida: DRAFT → ORDERED → RECEIVED, o CANCELLED desde DRAFT u ORDERED.
 * Recibirla suma stock y genera movimientos, todo en una sola transacción (RN-5).
 *
 * Ref: RF-30 a RF-35 — docs/10-esquema-base-de-datos.md §3.8
 */
@Entity('supplier_order')
@Index('idx_supplier_order_status', ['status'])
@Index('idx_supplier_order_supplier_id', ['supplierId'])
export class SupplierOrder {
  @PrimaryGeneratedColumn()
  id: number;

  /** Folio consecutivo por sucursal, con restricción única compuesta. */
  @Column({ name: 'order_number', type: 'varchar', length: 20, unique: true })
  orderNumber: string;

  @Column({ name: 'supplier_id', type: 'integer' })
  supplierId: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'branch_id', type: 'integer' })
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.purchaseOrders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'enum', enum: SupplierOrderStatus, default: SupplierOrderStatus.DRAFT })
  status: SupplierOrderStatus;

  @Column({ name: 'ordered_at', type: 'timestamptz', nullable: true })
  orderedAt: Date | null;

  @Column({ name: 'received_at', type: 'timestamptz', nullable: true })
  receivedAt: Date | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /** Quién creó la orden. */
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany('SupplierOrderItem', (item: SupplierOrderItem) => item.order, { cascade: true })
  items: SupplierOrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
