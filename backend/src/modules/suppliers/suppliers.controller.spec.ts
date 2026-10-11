import { describe, expect, it, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller.js';
import { SuppliersService } from './suppliers.service.js';

/** Pruebas delgadas del controller: verifica que delega al service con los argumentos correctos. */
describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      findOneOrFail: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      deactivate: vi.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [{ provide: SuppliersService, useValue: service }],
    }).compile();

    controller = moduleRef.get(SuppliersController);
  });

  it('findAll delega los filtros al service', async () => {
    const filters = { page: 1, limit: 20 };
    await controller.findAll(filters);
    expect(service.findAll).toHaveBeenCalledWith(filters);
  });

  it('findOne delega el id al service', async () => {
    await controller.findOne(5);
    expect(service.findOneOrFail).toHaveBeenCalledWith(5);
  });

  it('create delega el dto al service', async () => {
    const dto = { name: 'Distribuidora' };
    await controller.create(dto as never);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update delega el id y el dto al service', async () => {
    const dto = { phone: '5551234567' };
    await controller.update(5, dto as never);
    expect(service.update).toHaveBeenCalledWith(5, dto);
  });

  it('deactivate delega el id al service y responde con un mensaje', async () => {
    const result = await controller.deactivate(5);
    expect(service.deactivate).toHaveBeenCalledWith(5);
    expect(result.message).toBe('Proveedor desactivado.');
  });
});
