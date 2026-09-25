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
 * Pruebas de integracion de la API (RF-01, RF-02, RF-04, RF-51).
 *
 * Corren contra un PostgreSQL real con las migraciones aplicadas, que es la
 * unica forma de comprobar que el esquema, las restricciones y los guards
 * funcionan juntos.
 *
 * Requieren la base `storecore_test` levantada:
 *   docker compose up -d postgres
 *   DATABASE_NAME=storecore_test pnpm --filter backend test:e2e
 */
describe('API de StoreCore (integracion)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let cashierToken: string;
  let branchCode: string;
  let cashierUsername: string;

  const basePath = '/api/v1';

  beforeAll(async () => {
    const context = await createE2eContext();
    app = context.app;
    dataSource = context.dataSource;
    await runMigrations(dataSource);

    // Datos minimos: una sucursal, un administrador y un cajero.
    branchCode = unique('SUC');
    const branch = await dataSource.getRepository(Branch).save(
      dataSource.getRepository(Branch).create({
        code: branchCode,
        name: 'Sucursal de prueba',
        isActive: true,
      }),
    );

    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 4);
    const adminUsername = unique('admin');
    cashierUsername = unique('cajero');

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
      const context = { app, dataSource, moduleRef: null as never };
      await destroyE2eContext(context).catch(() => undefined);
    }
  });

  describe('RF-51 — endpoint de salud', () => {
    it('responde que la base de datos esta conectada', async () => {
      const response = await request(app.getHttpServer()).get(`${basePath}/health`).expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
      expect(response.body.timestamp).toBeTruthy();
    });

    it('no exige autenticacion', async () => {
      await request(app.getHttpServer()).get(`${basePath}/health`).expect(200);
    });
  });

  describe('RF-01 — inicio de sesion', () => {
    it('devuelve token y datos del usuario con credenciales correctas', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/auth/login`)
        .send({ username: cashierUsername, password: 'Cajero12345' })
        .expect(200);

      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.tokenType).toBe('Bearer');
      expect(response.body.user.username).toBe(cashierUsername);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('acepta el correo como nombre de usuario', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/auth/login`)
        .send({ username: `${cashierUsername}@storecore.test`, password: 'Cajero12345' })
        .expect(200);

      expect(response.body.accessToken).toBeTruthy();
    });

    it('rechaza una contraseña incorrecta con 401', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/auth/login`)
        .send({ username: cashierUsername, password: 'ContrasenaIncorrecta1' })
        .expect(401);

      expect(response.body.message).toBe('Usuario o contraseña incorrectos.');
    });

    it('rechaza un usuario inexistente con 401 y el mismo mensaje', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/auth/login`)
        .send({ username: 'usuario-que-no-existe', password: 'Cualquiera123' })
        .expect(401);

      expect(response.body.message).toBe('Usuario o contraseña incorrectos.');
    });

    it('rechaza un cuerpo incompleto con 400 y explica el motivo', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/auth/login`)
        .send({ username: 'ab' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBeTruthy();
    });
  });

  describe('RF-01 — token y sesion', () => {
    it('devuelve los datos del usuario con un token valido', async () => {
      const response = await request(app.getHttpServer())
        .get(`${basePath}/auth/me`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(response.body.username).toBe(cashierUsername);
      expect(response.body.role).toBe(UserRole.CASHIER);
    });

    it('rechaza una peticion sin token con 401', async () => {
      await request(app.getHttpServer()).get(`${basePath}/auth/me`).expect(401);
    });

    it('rechaza un token invalido con 401', async () => {
      await request(app.getHttpServer())
        .get(`${basePath}/auth/me`)
        .set('Authorization', 'Bearer token-inventado')
        .expect(401);
    });

    it('rechaza un token con la firma manipulada', async () => {
      const [header, payload] = cashierToken.split('.');
      const forged = `${header}.${payload}.firma-falsa`;

      await request(app.getHttpServer())
        .get(`${basePath}/auth/me`)
        .set('Authorization', `Bearer ${forged}`)
        .expect(401);
    });
  });

  describe('RF-02 — control de acceso por rol', () => {
    it('deja crear una sucursal al ADMIN', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/branches`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: unique('SUC'), name: 'Sucursal creada en la prueba' })
        .expect(201);
    });

    it('impide que el CAJERO cree una sucursal con 403', async () => {
      const response = await request(app.getHttpServer())
        .post(`${basePath}/branches`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ code: unique('SUC'), name: 'No deberia crearse' })
        .expect(403);

      expect(response.body.statusCode).toBe(403);
    });

    it('deja consultar las sucursales a cualquier usuario autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get(`${basePath}/branches`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('RF-04 — sucursales', () => {
    it('rechaza un codigo de sucursal duplicado con 409', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/branches`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: branchCode, name: 'Duplicada' })
        .expect(409);
    });

    it('rechaza un nombre vacio con 400', async () => {
      await request(app.getHttpServer())
        .post(`${basePath}/branches`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: unique('SUC'), name: '' })
        .expect(400);
    });

    it('rechaza un campo desconocido con 400 (mass assignment)', async () => {
      // whitelist + forbidNonWhitelisted impiden colar campos extra.
      await request(app.getHttpServer())
        .post(`${basePath}/branches`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: unique('SUC'), name: 'Con campo extra', isAdmin: true })
        .expect(400);
    });

    it('desactiva la sucursal en lugar de borrarla', async () => {
      const created = await request(app.getHttpServer())
        .post(`${basePath}/branches`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ code: unique('SUC'), name: 'Para desactivar' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`${basePath}/branches/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = await request(app.getHttpServer())
        .get(`${basePath}/branches/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(found.body.isActive).toBe(false);
    });
  });
});
