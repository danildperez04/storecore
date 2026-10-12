import { describe, expect, it, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductUnit } from '#common/enums/domain.enums.js';

/** Pruebas delgadas del controller: verifica que delega al service con los argumentos correctos. */
describe('ProductsController', () => {
  let controller: ProductsController;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      autocomplete: vi.fn().mockResolvedValue([]),
      findOneOrFail: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      deactivate: vi.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();

    controller = moduleRef.get(ProductsController);
  });

  it('findAll delega los filtros al service', async () => {
    const filters = { page: 1, limit: 20 };
    await controller.findAll(filters);
    expect(service.findAll).toHaveBeenCalledWith(filters);
  });

  it('autocomplete delega el texto, la sucursal y el límite al service', async () => {
    await controller.autocomplete({ q: 'coca', limit: 5 }, 3);
    expect(service.autocomplete).toHaveBeenCalledWith('coca', 3, 5);
  });

  it('findOne delega el id al service', async () => {
    await controller.findOne(5);
    expect(service.findOneOrFail).toHaveBeenCalledWith(5);
  });

  it('create usa la sucursal del body si viene, y si no la del usuario actual', async () => {
    const dto = {
      sku: 'ABC',
      name: 'Producto',
      categoryId: 1,
      unit: ProductUnit.UNIT,
      purchasePrice: 10,
      salePrice: 15,
      branchId: 7,
    };
    await controller.create(dto as never, 1, 3);
    expect(service.create).toHaveBeenCalledWith({ ...dto, branchId: 7, userId: 1 });

    const dtoSinSucursal = { ...dto, branchId: undefined };
    await controller.create(dtoSinSucursal as never, 1, 3);
    expect(service.create).toHaveBeenCalledWith({ ...dtoSinSucursal, branchId: 3, userId: 1 });
  });

  it('update delega el id y el dto al service', async () => {
    const dto = { name: 'Nuevo nombre' };
    await controller.update(5, dto as never);
    expect(service.update).toHaveBeenCalledWith(5, dto);
  });

  it('deactivate delega el id al service y responde con un mensaje', async () => {
    const result = await controller.deactivate(5);
    expect(service.deactivate).toHaveBeenCalledWith(5);
    expect(result.message).toBe('Producto desactivado.');
  });
});
