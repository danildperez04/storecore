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
import { StockMovementType } from '#common/enums/domain.enums.js';
import { Product } from '#modules/products/entities/product.entity.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';
import { User } from '#modules/users/entities/user.entity.js';

/**
 * Libro mayor de movimientos de stock (kardex).
 *
 * Esta tabla es APPEND-ONLY: no se actualiza ni se borra jamás. Los saldos de
 * `product_stock` se derivan de aquí, lo que hace auditable cualquier descuadre
 * (RNF-04, RN-3).
 *
 * `quantity` es siempre positiva; el signo lo determina `type`. Guardarlo así
 * hace que el kardex sea trivial de leer y que el total sea siempre la suma
 * algebraica de los movimientos.
 *
 * `previousQuantity` y `newQuantity` dejan el saldo explícito en cada renglón,
 * para no depender de recomputar toda la historia.
 *
 * Ref: RF-15 a RF-19, RNF-04, RNF-11 — docs/10-esquema-base-de-datos.md §3.7
 */
@Entity('stock_movement')
@Check('ck_stock_movement_quantity', '"quantity" > 0')
@Index('idx_stock_movement_product_id', ['productId'])
@Index('idx_stock_movement_created_at', ['createdAt'])
@Index('idx_stock_movement_branch_type', ['branchId', 'type'])
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.movements, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'branch_id', type: 'integer' })
  branchId: number;

  @ManyToOne(() => Branch, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  /** Cantidad del movimiento, siempre positiva. El signo lo define `type`. */
  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantity: string;

  /** Motivo. Obligatorio en ADJUSTMENT y WASTE; el servicio lo exige. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  /** Folio de la orden, ticket o nota relacionada. */
  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string | null;

  @Column({ name: 'previous_quantity', type: 'numeric', precision: 12, scale: 3 })
  previousQuantity: string;

  @Column({ name: 'new_quantity', type: 'numeric', precision: 12, scale: 3 })
  newQuantity: string;

  /** Quién ejecutó el movimiento (RNF-11, auditoría obligatoria). */
  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
