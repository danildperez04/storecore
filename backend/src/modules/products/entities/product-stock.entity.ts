import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';

/**
 * Existencia de un producto en una sucursal.
 *
 * Esta es la fila que se bloquea con `SELECT ... FOR UPDATE` durante una venta
 * o un ajuste. El bloqueo serializa dos operaciones concurrentes sobre el mismo
 * producto, que es el mecanismo detrás de RNF-03.
 *
 * La restricción `CHECK (quantity >= 0)` es la última línea de defensa contra el
 * stock negativo (RN-2). Si salta en producción, hay un bug grave.
 *
 * Ref: RF-14, RF-20, RN-2, RNF-03 — docs/10-esquema-base-de-datos.md §3.6
 */
@Entity('product_stock')
@Unique('uq_product_stock_pair', ['productId', 'branchId'])
@Check('ck_product_stock_quantity', '"quantity" >= 0')
@Index('idx_product_stock_branch_id', ['branchId'])
export class ProductStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.stocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'branch_id', type: 'integer' })
  branchId: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  /** Exist actual. Se deriva de los movimientos; nunca se edita a mano (RN-3). */
  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  quantity: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
