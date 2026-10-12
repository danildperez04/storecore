import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { hash } from 'bcrypt';
import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { createE2eContext, destroyE2eContext, runMigrations, unique } from './e2e-context.js';
import { User } from '#modules/users/entities/user.entity.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';
import { Category } from '#modules/categories/entities/category.entity.js';
import { Supplier } from '#modules/suppliers/entities/supplier.entity.js';
import { ProductStock } from '#modules/products/entities/product-stock.entity.js';
import { StockMovement } from '#modules/inventory/entities/stock-movement.entity.js';
import { ProductUnit, StockMovementType, UserRole } from '#common/enums/domain.enums.js';

/**
 * Pruebas de integración de productos (RF-09 a RF-13).
 *
 * El caso de mayor riesgo es RF-13: la creación con stock inicial debe dejar
 * en PostgreSQL real exactamente un `stock_movement` tipo INITIAL y la
 * cantidad correcta en `product_stock` — esto solo se puede verificar contra
 * una base real, no con repositorios mockeados.
 *
 * Requiere la base `storecore_test` levantada:
 *   docker compose up -d postgres
 *   DATABASE_NAME=storecore_test pnpm --filter backend test:e2e
 */
describe('API de productos (integración)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let cashierToken: string;
  let branchId: number;
  let categoryId: number;
  let supplierId: number;

  const basePath = '/api/v1';

  beforeAll(async () => {
    const context = await createE2eContext();
    app = context.app;
    dataSource = context.dataSource;
    await runMigrations(dataSource);

    const branch = await dataSource.getRepository(Branch).save(
      dataSource.getRepository(Branch).create({
        code: unique('SUC'),
        name: 'Sucursal de prueba',
        isActive: true,
      }),
    );
    branchId = branch.id;

    const category = await dataSource.getRepository(Category).save(
      dataSource.getRepository(Category).create({
        name: 'Categoría de prueba',
        slug: unique('cat-'),
        isActive: true,
      }),
    );
    categoryId = category.id;

    const supplier = await dataSource
      .getRepository(Supplier)
      .save(
        dataSource.getRepository(Supplier).create({ name: 'Proveedor de prueba', isActive: true }),
      );
    supplierId = supplier.id;

    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 4);
    const adminUsername = unique('admin');
    const cashierUsername = unique('cajero');

    const users = dataSource.getRepository(User);
    await users.save([
      users.create({
        username: adminUsername,
        email: `${adminUsername}@storecore.test`,
        passwordHash: await hash('Admin12345', rounds),
        fullName: 'Administrador de prueba',
        role: UserRole.ADMIN,
        branchId,
        isActive: true,
      }),
      users.create({
        username: cashierUsername,
        email: `${cashierUsername}@storecore.test`,
        passwordHash: await hash('Cajero12345', rounds),
        fullName: 'Cajero de prueba',
        role: UserRole.CASHIER,
        branchId,
        isActive: true,
      }),
    ]);

    const adminLogin = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .send({ username: adminUsername, password: 'Admin12345' })
      .expect(200);
    adminToken = adminLogin.body.accessToken as string;

    const cashierLogin = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .send({ username: cashierUsername, password: 'Cajero12345' })
      .expect(200);
    cashierToken = cashierLogin.body.accessToken as string;
  }, 60_000);

  afterAll(async () => {
    if (app) {
      await destroyE2eContext({ app, dataSource, moduleRef: null as never }).catch(() => undefined);
    }
  });

  function baseProduct(overrides: Record<string, unknown> = {}) {
    return {
      sku: unique('SKU'),
      name: 'Producto de prueba',
      categoryId,
      unit: ProductUnit.UNIT,
      purchasePrice: 10,
      salePrice: 15,
      ...overrides,
    };
  }

  describe('RF-09/RF-10 — creación y validación de precios', () => {
    it('crea un producto válido', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct({ supplierId }))
        .expect(201);

      expect(response.body.isActive).toBe(true);
      expect(response.body.category.id).toBe(categoryId);
    });

    it('rechaza un precio de venta no mayor al de compra con 400', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct({ purchasePrice: 10, salePrice: 10 }))
        .expect(400);
    });

    it('rechaza un SKU duplicado con 409', async () => {
      const sku = unique('SKU');
      await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct({ sku }))
        .expect(201);

      await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct({ sku }))
        .expect(409);
    });

    it('impide que el CAJERO cree un producto con 403', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send(baseProduct())
        .expect(403);
    });
  });

  describe('RF-13/HU-19 — stock inicial transaccional', () => {
    it('crea product_stock y exactamente un stock_movement INITIAL con los valores correctos', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct({ branchId, initialStock: 50 }))
        .expect(201);

      const productId = response.body.id as number;

      const stock = await dataSource.getRepository(ProductStock).findOneBy({ productId, branchId });
      expect(stock).not.toBeNull();
      expect(Number(stock?.quantity)).toBe(50);

      const movements = await dataSource.getRepository(StockMovement).find({
        where: { productId, branchId },
      });
      expect(movements).toHaveLength(1);
      expect(movements[0].type).toBe(StockMovementType.INITIAL);
      expect(Number(movements[0].previousQuantity)).toBe(0);
      expect(Number(movements[0].newQuantity)).toBe(50);
    });

    it('no crea stock cuando no se pide (branchId/initialStock ausentes)', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct())
        .expect(201);

      const productId = response.body.id as number;
      const stock = await dataSource.getRepository(ProductStock).findOneBy({ productId });
      expect(stock).toBeNull();
    });
  });

  describe('RF-11 — búsqueda y filtros', () => {
    it('encuentra un producto por nombre parcial, por SKU exacto y por código de barras', async () => {
      const sku = unique('FINDSKU');
      const barcode = unique('BAR');
      await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct({ sku, barcode, name: 'Galletas Marías' }))
        .expect(201);

      const byName = await request(app.getHttpServer())
        .get(`${basePath}/products?search=Marías`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(byName.body.data.some((p: { sku: string }) => p.sku === sku)).toBe(true);

      const bySku = await request(app.getHttpServer())
        .get(`${basePath}/products?search=${sku}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(bySku.body.data.some((p: { sku: string }) => p.sku === sku)).toBe(true);

      const byBarcode = await request(app.getHttpServer())
        .get(`${basePath}/products?search=${barcode}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(byBarcode.body.data.some((p: { sku: string }) => p.sku === sku)).toBe(true);
    });

    it('filtra por categoría, proveedor y estado combinados', async () => {
      const otherCategory = await dataSource.getRepository(Category).save(
        dataSource.getRepository(Category).create({
          name: 'Otra categoría',
          slug: unique('other-'),
          isActive: true,
        }),
      );

      const sku = unique('FILT');
      await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct({ sku, categoryId: otherCategory.id, supplierId }))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(
          `${basePath}/products?categoryId=${otherCategory.id}&supplierId=${supplierId}&isActive=true`,
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(
        response.body.data.every(
          (p: { category: { id: number } }) => p.category.id === otherCategory.id,
        ),
      ).toBe(true);
      expect(response.body.data.some((p: { sku: string }) => p.sku === sku)).toBe(true);
    });
  });

  describe('RF-12 — desactivación lógica', () => {
    it('oculta el producto desactivado del listado activo pero conserva la fila', async () => {
      const created = await request(app.getHttpServer())
        .post(`${basePath}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(baseProduct())
        .expect(201);

      await request(app.getHttpServer())
        .delete(`${basePath}/products/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = await request(app.getHttpServer())
        .get(`${basePath}/products/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(found.body.isActive).toBe(false);

      const activeList = await request(app.getHttpServer())
        .get(`${basePath}/products?isActive=true`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(activeList.body.data.some((p: { id: number }) => p.id === created.body.id)).toBe(
        false,
      );
    });
  });
});
