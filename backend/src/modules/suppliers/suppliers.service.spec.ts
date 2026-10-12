import { describe, expect, it, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service.js';
import { Supplier } from './entities/supplier.entity.js';

function makeSupplier(overrides: Partial<Supplier> = {}): Supplier {
  return Object.assign(new Supplier(), {
    id: 1,
    name: 'Distribuidora La Central',
    contactName: 'Juan Pérez',
    phone: '5551234567',
    email: 'contacto@lacentral.test',
    address: 'Av. Reforma 100',
    notes: null,
    isActive: true,
    ...overrides,
  });
}

describe('SuppliersService', () => {
  let service: SuppliersService;
  let findOneBy: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;

  let getManyAndCount: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findOneBy = vi.fn();
    save = vi.fn().mockImplementation((entity: Supplier) => {
      entity.id = entity.id ?? 99;
      return Promise.resolve(entity);
    });
    getManyAndCount = vi.fn().mockResolvedValue([[makeSupplier()], 1]);

    const queryBuilder = {
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: getRepositoryToken(Supplier),
          useValue: {
            findOneBy,
            save,
            create: (data: unknown) => Object.assign(new Supplier(), data),
            createQueryBuilder: vi.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(SuppliersService);
  });

  describe('create', () => {
    it('crea el proveedor con los campos opcionales en null', async () => {
      const result = await service.create({ name: 'Nuevo Proveedor' });

      expect(result.name).toBe('Nuevo Proveedor');
      expect(result.contactName).toBeNull();
      expect(result.isActive).toBe(true);
    });

    it('permite dos proveedores con el mismo nombre comercial', async () => {
      // El esquema no exige unicidad de nombre (dos repartidores de la misma marca).
      findOneBy.mockResolvedValue(makeSupplier());

      const result = await service.create({ name: 'Distribuidora La Central' });

      expect(result.name).toBe('Distribuidora La Central');
      expect(save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('actualiza los campos indicados y deja el resto intacto', async () => {
      findOneBy.mockResolvedValue(makeSupplier());

      const result = await service.update(1, { phone: '5559998877' });

      expect(result.phone).toBe('5559998877');
      expect(result.name).toBe('Distribuidora La Central');
    });

    it('permite limpiar un campo opcional enviándolo como null', async () => {
      findOneBy.mockResolvedValue(makeSupplier());

      const result = await service.update(1, { email: null });

      expect(result.email).toBeNull();
    });

    it('lanza 404 si el proveedor no existe', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.update(42, { name: 'No existe' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('devuelve una página con los datos y el total', async () => {
      const result = await service.findAll({ search: 'central', isActive: true });

      expect(getManyAndCount).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('deactivate', () => {
    it('desactiva el proveedor sin borrarlo (RN-8)', async () => {
      const supplier = makeSupplier();
      findOneBy.mockResolvedValue(supplier);

      await service.deactivate(1);

      expect(supplier.isActive).toBe(false);
      expect(save).toHaveBeenCalledWith(supplier);
    });

    it('lanza 404 si el proveedor no existe', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.deactivate(7)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
