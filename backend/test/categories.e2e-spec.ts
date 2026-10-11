import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { hash } from 'bcrypt';
import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { createE2eContext, destroyE2eContext, runMigrations, unique } from './e2e-context.js';
import { User } from '#modules/users/entities/user.entity.js';
import { Branch } from '#modules/branches/entities/branch.entity.js';
import { UserRole } from '#common/enums/domain.enums.js';

/**
 * Pruebas de integración de categorías (RF-07, RN-8).
 *
 * Requiere la base `storecore_test` levantada:
 *   docker compose up -d postgres
 *   DATABASE_NAME=storecore_test pnpm --filter backend test:e2e
 */
describe('API de categorías (integración)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let cashierToken: string;

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
        branchId: branch.id,
        isActive: true,
      }),
      users.create({
        username: cashierUsername,
        email: `${cashierUsername}@storecore.test`,
        passwordHash: await hash('Cajero12345', rounds),
        fullName: 'Cajero de prueba',
        role: UserRole.CASHIER,
        branchId: branch.id,
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

  describe('RF-07 — CRUD de categorías', () => {
    it('deja crear una categoría raíz al ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Bebidas' })
        .expect(201);

      expect(response.body.slug).toBe('bebidas');
      expect(response.body.parentId).toBeNull();
    });

    it('impide que el CAJERO cree una categoría con 403', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ name: 'No debería crearse' })
        .expect(403);
    });

    it('deja consultar las categorías a cualquier usuario autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get(`${basePath}/categories`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('crea una subcategoría con un padre válido', async () => {
      const parent = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Lácteos' })
        .expect(201);

      const child = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Yogures', parentId: parent.body.id })
        .expect(201);

      expect(child.body.parentId).toBe(parent.body.id);
    });

    it('GET /categories/tree devuelve el árbol anidado, no una lista plana', async () => {
      const parent = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Árbol-' + unique('') })
        .expect(201);

      const child = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Rama-' + unique(''), parentId: parent.body.id })
        .expect(201);

      const tree = await request(app.getHttpServer())
        .get(`${basePath}/categories/tree`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const parentNode = tree.body.find((node: { id: number }) => node.id === parent.body.id);
      expect(parentNode).toBeDefined();
      expect(parentNode.children.some((n: { id: number }) => n.id === child.body.id)).toBe(true);
    });

    it('rechaza un parentId inexistente con 404', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Huérfana', parentId: 999999 })
        .expect(404);
    });

    it('rechaza un ciclo real al mover una categoría bajo su propio nieto', async () => {
      const a = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'A-' + unique('') })
        .expect(201);

      const b = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'B-' + unique(''), parentId: a.body.id })
        .expect(201);

      const c = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'C-' + unique(''), parentId: b.body.id })
        .expect(201);

      // Mover A para que su padre sea C (nieto de A) es un ciclo.
      await request(app.getHttpServer())
        .patch(`${basePath}/categories/${a.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ parentId: c.body.id })
        .expect(400);
    });

    it('desactiva la categoría en lugar de borrarla', async () => {
      const created = await request(app.getHttpServer())
        .post(`${basePath}/categories`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Para desactivar ' + unique('') })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`${basePath}/categories/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = await request(app.getHttpServer())
        .get(`${basePath}/categories/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(found.body.isActive).toBe(false);
    });
  });
});
