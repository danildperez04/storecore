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
 * Pruebas de integración de proveedores (RF-08, RN-8).
 *
 * Requiere la base `storecore_test` levantada:
 *   docker compose up -d postgres
 *   DATABASE_NAME=storecore_test pnpm --filter backend test:e2e
 */
describe('API de proveedores (integración)', () => {
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

  describe('RF-08 — CRUD de proveedores', () => {
    it('deja crear un proveedor al ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/suppliers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Distribuidora La Central', phone: '5551234567' })
        .expect(201);

      expect(response.body.name).toBe('Distribuidora La Central');
      expect(response.body.isActive).toBe(true);
    });

    it('impide que el CAJERO cree un proveedor con 403', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/suppliers`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ name: 'No debería crearse' })
        .expect(403);
    });

    it('permite dos proveedores con el mismo nombre comercial', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/suppliers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Repartidor Genérico' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`${basePath}/suppliers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Repartidor Genérico' })
        .expect(201);
    });

    it('rechaza un correo inválido con 400', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/suppliers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Proveedor con correo malo', email: 'no-es-un-correo' })
        .expect(400);
    });

    it('desactiva el proveedor en lugar de borrarlo', async () => {
      const created = await request(app.getHttpServer())
        .post(`${basePath}/suppliers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Para desactivar' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`${basePath}/suppliers/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = await request(app.getHttpServer())
        .get(`${basePath}/suppliers/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(found.body.isActive).toBe(false);
    });
  });
});
