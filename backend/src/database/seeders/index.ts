import { Logger } from '@nestjs/common';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { StockMovementType, UserRole } from '#common/enums/domain.enums.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';
import { User } from '#modules/users/entities/user.entity.js';
import { Category } from '#modules/categories/entities/category.entity.js';
import { Supplier } from '#modules/suppliers/entities/supplier.entity.js';
import { Product } from '#modules/products/entities/product.entity.js';
import { ProductStock } from '#modules/products/entities/product-stock.entity.js';
import { StockMovement } from '#modules/inventory/entities/stock-movement.entity.js';
import { Customer } from '#modules/customers/entities/customer.entity.js';
import {
  SEED_BRANCHES,
  SEED_CATEGORIES,
  SEED_CUSTOMERS,
  SEED_PRODUCTS,
  SEED_SUPPLIERS,
  SEED_USERS,
} from './seed-data.js';

const logger = new Logger('Seeder');

/**
 * Carga los datos iniciales.
 *
 * Es IDEMPOTENTE: se puede ejecutar las veces que haga falta sin duplicar,
 * porque cada entidad se busca primero por su clave natural.
 *
 * La carga de stock inicial registra un movimiento de tipo INITIAL, para que el
 * kardex explique desde el primer momento por qué el stock es el que es (RN-3,
 * RNF-04).
 */
export async function runSeeders(dataSource: DataSource): Promise<void> {
  const bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

  // ---------- Sucursales ----------
  const branchRepo = dataSource.getRepository(Branch);
  const branchByCode = new Map<string, number>();
  for (const seed of SEED_BRANCHES) {
    const existing = await branchRepo.findOneBy({ code: seed.code });
    const branch =
      existing ?? (await branchRepo.save(branchRepo.create({ ...seed, isActive: true })));
    branchByCode.set(seed.code, branch.id);
  }
  logger.log(`${SEED_BRANCHES.length} sucursales listas`);

  // ---------- Categorías, con jerarquía ----------
  const categoryRepo = dataSource.getRepository(Category);
  const categoryBySlug = new Map<string, number>();
  for (const seed of SEED_CATEGORIES) {
    const parentId = seed.parent ? (categoryBySlug.get(seed.parent) ?? null) : null;
    const existing = await categoryRepo.findOneBy({ slug: seed.slug });
    const category =
      existing ??
      (await categoryRepo.save(
        categoryRepo.create({
          name: seed.name,
          slug: seed.slug,
          parentId,
          icon: seed.icon,
          isActive: true,
        }),
      ));
    categoryBySlug.set(seed.slug, category.id);
  }
  logger.log(`${SEED_CATEGORIES.length} categorías listas`);

  // ---------- Proveedores ----------
  const supplierRepo = dataSource.getRepository(Supplier);
  const supplierByName = new Map<string, number>();
  for (const seed of SEED_SUPPLIERS) {
    const existing = await supplierRepo.findOneBy({ name: seed.name });
    const supplier =
      existing ?? (await supplierRepo.save(supplierRepo.create({ ...seed, isActive: true })));
    supplierByName.set(seed.name, supplier.id);
  }
  logger.log(`${SEED_SUPPLIERS.length} proveedores listos`);

  // ---------- Usuarios ----------
  const userRepo = dataSource.getRepository(User);
  const userByUsername = new Map<string, number>();
  for (const seed of SEED_USERS) {
    const existing = await userRepo.findOneBy({ username: seed.username });
    const user =
      existing ??
      (await userRepo.save(
        userRepo.create({
          username: seed.username,
          email: seed.email,
          // bcrypt con las rondas configuradas (RNF-05).
          passwordHash: await hash(seed.password, bcryptRounds),
          fullName: seed.fullName,
          role: seed.role as UserRole,
          branchId: branchByCode.get(seed.branch) ?? null,
          isActive: true,
        }),
      ));
    userByUsername.set(seed.username, user.id);
  }
  logger.log(`${SEED_USERS.length} usuarios listos`);

  // ---------- Clientes ----------
  const customerRepo = dataSource.getRepository(Customer);
  for (const seed of SEED_CUSTOMERS) {
    const existing = await customerRepo.findOneBy({ name: seed.name });
    if (!existing) {
      await customerRepo.save(customerRepo.create({ ...seed, isActive: true }));
    }
  }
  logger.log(`${SEED_CUSTOMERS.length} clientes listos`);

  // ---------- Productos y stock inicial ----------
  const productRepo = dataSource.getRepository(Product);
  const stockRepo = dataSource.getRepository(ProductStock);
  const movementRepo = dataSource.getRepository(StockMovement);
  const centralBranchId = branchByCode.get('CENTRAL');
  const adminId = userByUsername.get('admin');
  let createdProducts = 0;
  let createdStocks = 0;

  for (const seed of SEED_PRODUCTS) {
    const categoryId = categoryBySlug.get(seed.category);
    if (categoryId === undefined) {
      throw new Error(`Categoría desconocida para ${seed.sku}: ${seed.category}`);
    }
    const supplierId = supplierByName.get(seed.supplier) ?? null;

    const existing = await productRepo.findOneBy({ sku: seed.sku });
    const product =
      existing ??
      (await productRepo.save(
        productRepo.create({
          sku: seed.sku,
          barcode: seed.barcode,
          name: seed.name,
          description: null,
          categoryId,
          supplierId,
          unit: seed.unit,
          purchasePrice: seed.purchasePrice,
          salePrice: seed.salePrice,
          minStock: seed.minStock,
          isActive: true,
        }),
      ));
    if (!existing) createdProducts += 1;

    if (centralBranchId === undefined || adminId === undefined) continue;

    const stockExists = await stockRepo.findOneBy({
      productId: product.id,
      branchId: centralBranchId,
    });
    if (stockExists) continue;

    // La fila nace en 0 y el movimiento explica el salto. Así el kardex
    // nunca muestra una existencia sin justificación.
    const stock = await stockRepo.save(
      stockRepo.create({ productId: product.id, branchId: centralBranchId, quantity: '0' }),
    );
    await movementRepo.save(
      movementRepo.create({
        productId: product.id,
        branchId: centralBranchId,
        type: StockMovementType.INITIAL,
        quantity: seed.initialStock,
        reason: 'Carga inicial del catálogo',
        reference: 'SEED',
        previousQuantity: '0',
        newQuantity: seed.initialStock,
        userId: adminId,
      }),
    );
    await stockRepo.update(stock.id, { quantity: seed.initialStock });
    createdStocks += 1;
  }
  logger.log(`${createdProducts} productos creados, ${createdStocks} con stock inicial`);
}

/** Punto de entrada para `pnpm seed:run`. */
export async function main(): Promise<void> {
  const { default: dataSource } = await import('../data-source.js');
  logger.log('Cargando datos iniciales...');
  await dataSource.initialize();
  try {
    await runSeeders(dataSource);
    logger.log('Datos iniciales cargados correctamente.');
  } finally {
    await dataSource.destroy();
  }
}
