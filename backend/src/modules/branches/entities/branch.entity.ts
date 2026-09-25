import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// Lados inversos: solo tipos. Importar la clase crearia un ciclo en ESM
// (Branch -> Sale -> Branch) y la entidad se usaria antes de inicializarse.
import type { CashShift } from '#modules/cash/entities/cash-shift.entity.js';
import type { Sale } from '#modules/sales/entities/sale.entity.js';
import type { SupplierOrder } from '#modules/purchases/entities/supplier-order.entity.js';
import type { User } from '#modules/users/entities/user.entity.js';

/**
 * Sucursal: punto de venta físico con su propio stock y sus propias ventas.
 * Ref: RF-04 — docs/10-esquema-base-de-datos.md §3.1
 */
@Entity('branch')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany('User', (user: User) => user.branch)
  users: User[];

  @OneToMany('Sale', (sale: Sale) => sale.branch)
  sales: Sale[];

  @OneToMany('SupplierOrder', (order: SupplierOrder) => order.branch)
  purchaseOrders: SupplierOrder[];

  @OneToMany('CashShift', (shift: CashShift) => shift.branch)
  cashShifts: CashShift[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
