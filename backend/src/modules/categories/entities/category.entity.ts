import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
// Lado inverso: solo tipo (ver Branch). TypeORM resuelve por el otro lado.
import type { Product } from '#modules/products/entities/product.entity.js';

/**
 * Categoría de productos, con jerarquía (una categoría puede tener una padre).
 * Ref: RF-07 — docs/10-esquema-base-de-datos.md §3.3
 */
@Entity('category')
@Tree('adjacency-list')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  slug: string;

  @Column({ name: 'parent_id', type: 'integer', nullable: true })
  parentId: number | null;

  @TreeParent()
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @TreeChildren()
  children: Category[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany('Product', (product: Product) => product.category)
  products: Product[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
