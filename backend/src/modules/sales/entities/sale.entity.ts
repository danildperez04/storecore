import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod, SaleStatus } from '#common/enums/domain.enums.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';
import { User } from '#modules/users/entities/user.entity.js';
import { Customer } from '#modules/customers/entities/customer.entity.js';
import { CashShift } from '#modules/cash/entities/cash-shift.entity.js';
// Lado inverso: solo tipo (ver Branch).
import type { SaleItem } from './sale-item.entity.js';

/**
 * Venta (cabecera).
 *
 * El total NO se edita a mano: se deriva de la suma de sus `sale_item`
 * (RN-7, CHECK `total = subtotal - discount`).
 *
 * El folio es único POR SUCURSAL. Se reserva con `SELECT ... FOR UPDATE` sobre
 * la fila de la sucursal, nunca con `MAX(sale_number) + 1`: con dos cajeros
 * cobrando, `MAX` devolvería el mismo número a ambos (RF-27, RN-9).
 *
 * Una venta anulada no se borra: se marca CANCELLED y se devuelve el stock.
 * Es el registro contable del negocio (RF-28).
 *
 * Ref: RF-25 a RF-28 — docs/10-esquema-base-de-datos.md §3.10
 */
@Entity('sale')
@Check('ck_sale_totals', '"total" = "subtotal" - "discount"')
@Check('ck_sale_amounts', '"subtotal" >= 0 AND "discount" >= 0 AND "total" >= 0')
@Index('idx_sale_created_at', ['createdAt'])
@Index('idx_sale_branch_status', ['branchId', 'status'])
@Index('idx_sale_customer_id', ['customerId'])
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sale_number', type: 'varchar', length: 20 })
  saleNumber: string;

  @Column({ name: 'branch_id', type: 'integer' })
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.sales, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  /** Cajero que registró la venta. */
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Presente solo si la venta es a crédito. */
  @Column({ name: 'customer_id', type: 'integer', nullable: true })
  customerId: number | null;

  @ManyToOne(() => Customer, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;

  /** Caja que estaba abierta al momento de la venta. */
  @Column({ name: 'cash_shift_id', type: 'integer', nullable: true })
  cashShiftId: number | null;

  @ManyToOne(() => CashShift, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cash_shift_id' })
  cashShift: CashShift | null;

  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.COMPLETED })
  status: SaleStatus;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  /** Efectivo entregado por el cliente, para calcular el cambio. */
  @Column({ name: 'amount_received', type: 'numeric', precision: 12, scale: 2, nullable: true })
  amountReceived: string | null;

  @Column({ name: 'change_given', type: 'numeric', precision: 12, scale: 2, nullable: true })
  changeGiven: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancelled_by_id', type: 'integer', nullable: true })
  cancelledById: number | null;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelledBy: User | null;

  @Column({ name: 'cancellation_reason', type: 'varchar', length: 255, nullable: true })
  cancellationReason: string | null;

  @OneToMany('SaleItem', (item: SaleItem) => item.sale, { cascade: true })
  items: SaleItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
