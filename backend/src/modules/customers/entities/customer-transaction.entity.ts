import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerTransactionType } from '#common/enums/domain.enums.js';
import { Customer } from './customer.entity.js';
import { User } from '#modules/users/entities/user.entity.js';
import { Sale } from '#modules/sales/entities/sale.entity.js';

/**
 * Movimiento en la cuenta corriente de un cliente: cargo o abono.
 *
 * `amount` es siempre positivo; el efecto sobre el adeudo lo define `type`:
 * CHARGE suma, PAYMENT resta.
 *
 * Saldo del cliente:
 *   SUM(CASE WHEN type = 'CHARGE' THEN amount ELSE -amount END)
 *
 * Ref: RF-37, RF-39, RN-6 — docs/10-esquema-base-de-datos.md §3.13
 */
@Entity('customer_transaction')
@Check('ck_customer_transaction_amount', '"amount" > 0')
@Index('idx_customer_transaction_customer_id', ['customerId'])
@Index('idx_customer_transaction_created_at', ['createdAt'])
export class CustomerTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id', type: 'integer' })
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'enum', enum: CustomerTransactionType })
  type: CustomerTransactionType;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  /** Presente en los cargos generados por una venta a crédito. */
  @Column({ name: 'sale_id', type: 'integer', nullable: true })
  saleId: number | null;

  @ManyToOne(() => Sale, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale | null;

  /** Quién registró el movimiento. */
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
