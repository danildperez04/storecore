import { describe, expect, it, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BranchesService } from './branches.service.js';
import { Branch } from './entities/branch.entity.js';

/**
 * Pruebas del servicio de sucursales (RF-04, RN-8).
 *
 * Se verifica el comportamiento observable:
 *   - el codigo de sucursal es unico
 *   - una sucursal inexistente lanza 404
 *   - desactivar no borra: la fila sigue existiendo con is_active = false
 */

function makeBranch(overrides: Partial<Branch> = {}): Branch {
  return Object.assign(new Branch(), {
    id: 1,
    code: 'CENTRAL',
    name: 'Sucursal Central',
    address: 'Av. Juárez 100',
    phone: '5551234567',
    isActive: true,
    ...overrides,
  });
}

describe('BranchesService', () => {
  let service: BranchesService;
  let findOneBy: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findOneBy = vi.fn();
    save = vi.fn().mockImplementation((entity: Branch) => {
      entity.id = entity.id ?? 99;
      return Promise.resolve(entity);
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: getRepositoryToken(Branch),
          useValue: {
            findOneBy,
            save,
            create: (data: unknown) => Object.assign(new Branch(), data),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(BranchesService);
  });

  describe('create', () => {
    it('crea la sucursal y la deja activa', async () => {
      findOneBy.mockResolvedValue(null);

      const result = await service.create({
        code: 'NORTE',
        name: 'Sucursal Norte',
        address: null,
        phone: null,
      });

      expect(result.code).toBe('NORTE');
      expect(result.isActive).toBe(true);
      expect(save).toHaveBeenCalled();
    });

    it('rechaza un codigo ya existente con 409', async () => {
      findOneBy.mockResolvedValue(makeBranch({ code: 'CENTRAL' }));

      await expect(service.create({ code: 'CENTRAL', name: 'Duplicada' })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('menciona el codigo duplicado en el mensaje', async () => {
      findOneBy.mockResolvedValue(makeBranch());

      const error = await service.create({ code: 'CENTRAL', name: 'X' }).catch((e: unknown) => e);

      expect((error as Error).message).toContain('CENTRAL');
    });
  });

  describe('findOneOrFail', () => {
    it('devuelve la sucursal cuando existe', async () => {
      findOneBy.mockResolvedValue(makeBranch());

      const result = await service.findOneOrFail(1);

      expect(result.name).toBe('Sucursal Central');
    });

    it('lanza 404 cuando no existe', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.findOneOrFail(999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('actualiza los campos indicados', async () => {
      findOneBy.mockResolvedValue(makeBranch());

      const result = await service.update(1, { name: 'Sucursal Centro' });

      expect(result.name).toBe('Sucursal Centro');
    });

    it('rechaza cambiar a un codigo ya tomado por otra sucursal', async () => {
      findOneBy
        .mockResolvedValueOnce(makeBranch({ id: 1, code: 'CENTRAL' }))
        .mockResolvedValueOnce(makeBranch({ id: 2, code: 'NORTE' }));

      await expect(service.update(1, { code: 'NORTE' })).rejects.toBeInstanceOf(ConflictException);
    });

    it('permite conservar el mismo codigo sin dar conflicto', async () => {
      // Editar el nombre dejando el codigo intacto no debe rebotar contra si mismo.
      findOneBy.mockResolvedValue(makeBranch({ id: 1, code: 'CENTRAL' }));

      const result = await service.update(1, { code: 'CENTRAL', name: 'Renombrada' });

      expect(result.name).toBe('Renombrada');
    });

    it('deja intactos los campos no enviados', async () => {
      findOneBy.mockResolvedValue(makeBranch({ address: 'Av. Juárez 100', phone: '5551234567' }));

      const result = await service.update(1, { name: 'Solo el nombre' });

      expect(result.address).toBe('Av. Juárez 100');
      expect(result.phone).toBe('5551234567');
    });

    it('permite limpiar un campo opcional enviandolo como null', async () => {
      findOneBy.mockResolvedValue(makeBranch({ address: 'Av. Juárez 100' }));

      const result = await service.update(1, { address: null });

      expect(result.address).toBeNull();
    });

    it('lanza 404 si la sucursal no existe', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.update(42, { name: 'No existe' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('deactivate', () => {
    it('desactiva la sucursal sin borrarla (RN-8)', async () => {
      const branch = makeBranch();
      findOneBy.mockResolvedValue(branch);

      await service.deactivate(1);

      expect(branch.isActive).toBe(false);
      // Se guarda la fila, no se destruye: sus ventas quedan referenciadas.
      expect(save).toHaveBeenCalledWith(branch);
    });

    it('lanza 404 si la sucursal no existe', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.deactivate(7)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
