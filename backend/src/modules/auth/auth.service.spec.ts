import { describe, expect, it, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '#modules/users/entities/user.entity.js';
import { UserRole } from '#common/enums/domain.enums.js';

/**
 * Pruebas del servicio de autenticacion (RF-01, RF-05, RNF-05).
 *
 * Se verifica el comportamiento observable, no la llamada a bcrypt: el hash es
 * un detalle de implementacion. Lo que importa es que una contraseña correcta
 * entre, una incorrecta no, y que una cuenta desactivada no pueda entrar.
 */

interface UserOverrides {
  id?: number;
  username?: string;
  passwordHash?: string;
  isActive?: boolean;
  role?: UserRole;
  branchId?: number | null;
}

/** bcrypt de "ClaveCorrecta123" con 4 rondas, para que las pruebas sean rapidas. */
const HASH_VALIDO = '$2b$04$0Ah5yM5HvZHwJdbmDd1khOR./o.OJCE/cAhaYI3r/cleh48qYsyvG';
const HASH_SENO = '$2b$04$m5A.1zhnOr7nocHB0KpG/.aWoBUm80kXrmnB3aatXXEtqVNv7s8Fy';

function buildUser(overrides: UserOverrides = {}): User {
  return Object.assign(new User(), {
    id: 1,
    username: 'admin',
    email: 'admin@storecore.mx',
    passwordHash: HASH_VALIDO,
    fullName: 'Administrador',
    role: UserRole.ADMIN,
    branchId: 1,
    isActive: true,
    lastLoginAt: null,
    ...overrides,
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let findOneBy: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let signAsync: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findOneBy = vi.fn();
    update = vi.fn().mockResolvedValue({ affected: 1 });
    signAsync = vi.fn().mockResolvedValue('token-fake');

    const userRepository = {
      findOneBy,
      update,
      createQueryBuilder: vi.fn(() => ({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orWhere: vi.fn().mockReturnThis(),
        getOne: findOneBy,
      })),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: { signAsync } },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: unknown) => {
              // El setup de pruebas baja BCRYPT_ROUNDS a 4 para acelerar los hashes.
              if (key === 'BCRYPT_ROUNDS') return 4;
              return fallback;
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('devuelve token y datos del usuario con credenciales correctas', async () => {
      findOneBy.mockResolvedValue(buildUser());

      const result = await service.login({ username: 'admin', password: 'ClaveCorrecta123' });

      expect(result.accessToken).toBe('token-fake');
      expect(result.tokenType).toBe('Bearer');
      expect(result.user.username).toBe('admin');
      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(result.user.branchId).toBe(1);
    });

    it('nunca expone el hash de la contraseña', async () => {
      findOneBy.mockResolvedValue(buildUser());

      const result = await service.login({ username: 'admin', password: 'ClaveCorrecta123' });

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(result)).not.toContain(HASH_VALIDO);
    });

    it('rechaza una contraseña incorrecta', async () => {
      findOneBy.mockResolvedValue(buildUser({ passwordHash: HASH_SENO }));

      await expect(
        service.login({ username: 'admin', password: 'ClaveEquivocada999' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza un usuario inexistente', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(
        service.login({ username: 'fantasma', password: 'ClaveCorrecta123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('da el mismo mensaje para usuario inexistente y contraseña incorrecta', async () => {
      // Distinguir los dos casos permite enumerar que usuarios existen.
      findOneBy.mockResolvedValue(null);
      const errorInexistente = await service
        .login({ username: 'fantasma', password: 'ClaveCorrecta123' })
        .catch((e: unknown) => e);

      findOneBy.mockResolvedValue(buildUser({ passwordHash: HASH_SENO }));
      const errorIncorrecta = await service
        .login({ username: 'admin', password: 'ClaveEquivocada999' })
        .catch((e: unknown) => e);

      expect((errorInexistente as Error).message).toBe((errorIncorrecta as Error).message);
    });

    it('rechaza una cuenta desactivada aunque la contraseña sea correcta', async () => {
      findOneBy.mockResolvedValue(buildUser({ isActive: false }));

      await expect(
        service.login({ username: 'admin', password: 'ClaveCorrecta123' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('registra el momento del ultimo acceso', async () => {
      findOneBy.mockResolvedValue(buildUser({ id: 7 }));

      await service.login({ username: 'admin', password: 'ClaveCorrecta123' });

      expect(update).toHaveBeenCalledWith(7, {
        lastLoginAt: expect.any(Date),
      });
    });

    it('no registra el acceso cuando la autenticacion falla', async () => {
      findOneBy.mockResolvedValue(buildUser({ passwordHash: HASH_SENO }));

      await service.login({ username: 'admin', password: 'Mala123456' }).catch(() => undefined);

      expect(update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('actualiza el hash cuando la contraseña actual es correcta', async () => {
      findOneBy.mockResolvedValue(buildUser());
      const hashSpy = vi.spyOn(service, 'hash').mockResolvedValue('hash-nuevo');

      await service.changePassword(1, 'ClaveCorrecta123', 'ClaveNueva456');

      expect(hashSpy).toHaveBeenCalledWith('ClaveNueva456');
      expect(update).toHaveBeenCalledWith(1, { passwordHash: 'hash-nuevo' });
    });

    it('rechaza el cambio cuando la contraseña actual no coincide', async () => {
      findOneBy.mockResolvedValue(buildUser({ passwordHash: HASH_SENO }));

      await expect(
        service.changePassword(1, 'NoEsLaMia123', 'ClaveNueva456'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('devuelve los datos del usuario de la sesion', async () => {
      findOneBy.mockResolvedValue(buildUser({ id: 3, username: 'cajero', role: UserRole.CASHIER }));

      const result = await service.me(3);

      expect(result.id).toBe(3);
      expect(result.username).toBe('cajero');
      expect(result.role).toBe(UserRole.CASHIER);
    });

    it('rechaza una sesion cuyo usuario ya no existe', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.me(99)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
