import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CashShiftStatus } from '#common/enums/domain.enums.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';
import { User } from '#modules/users/entities/user.entity.js';

/**
 * Turno de caja: apertura, ventas del turno y cierre con arqueo.
 *
 * expected_amount = opening_amount + sales_cash
 * difference      = closing_amount - expected_amount
 *
 * Solo entra al arqueo de efectivo el pago en efectivo. Las ventas con tarjeta,
 * transferencia o crédito no se cuentan en el efectivo de la caja.
 *
 * Existe un índice único PARCIAL que garantiza una sola caja abierta por
 * sucursal (`uq_cash_shift_open` en la migración inicial).
 *
 * Ref: RF-29 — docs/10-esquema-base-de-datos.md §3.14
 */
@Entity('cash_shift')
@Index('idx_cash_shift_branch_id', ['branchId'])
@Index('idx_cash_shift_opened_at', ['openedAt'])
export class CashShift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id', type: 'integer' })
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.cashShifts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  /** Quién abrió la caja. */
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: CashShiftStatus, default: CashShiftStatus.OPEN })
  status: CashShiftStatus;

  /** Efectivo con el que abre la caja. */
  @Column({ name: 'opening_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  openingAmount: string;

  /** Efectivo contado al cerrar. */
  @Column({ name: 'closing_amount', type: 'numeric', precision: 12, scale: 2, nullable: true })
  closingAmount: string | null;

  /** Efectivo que el sistema espera: opening + ventas en efectivo. */
  @Column({ name: 'expected_amount', type: 'numeric', precision: 12, scale: 2, nullable: true })
  expectedAmount: string | null;

  /** closing_amount - expected_amount. Positivo sobrante, negativo faltante. */
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  difference: string | null;

  @Column({ name: 'sales_cash', type: 'numeric', precision: 12, scale: 2, default: 0 })
  salesCash: string;

  @Column({ name: 'sales_card', type: 'numeric', precision: 12, scale: 2, default: 0 })
  salesCard: string;

  @Column({ name: 'sales_transfer', type: 'numeric', precision: 12, scale: 2, default: 0 })
  salesTransfer: string;

  @Column({ name: 'sales_total', type: 'numeric', precision: 12, scale: 2, default: 0 })
  salesTotal: string;

  @Column({ name: 'opened_at', type: 'timestamptz' })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
