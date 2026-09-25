import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// Lado inverso: solo tipo (ver Branch).
import type { CustomerTransaction } from './customer-transaction.entity.js';

/**
 * Cliente de la tienda, con posibilidad de fiado.
 *
 * NO existe una columna `balance`: el adeudo se DERIVA sumando sus
 * `customer_transaction` (RN-6). Una columna de saldo es una fuente de
 * descuadres; la consulta que lo suma nunca se desincroniza.
 *
 * Ref: RF-36, RF-38 — docs/10-esquema-base-de-datos.md §3.12
 */
@Entity('customer')
@Index('idx_customer_name', ['name'])
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  /** Límite de dinero que la tienda está dispuesta a fiarle (RF-38). */
  @Column({ name: 'credit_limit', type: 'numeric', precision: 12, scale: 2, default: 0 })
  creditLimit: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany('CustomerTransaction', (transaction: CustomerTransaction) => transaction.customer)
  transactions: CustomerTransaction[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
