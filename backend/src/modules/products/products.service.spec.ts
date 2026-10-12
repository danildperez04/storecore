import { describe, expect, it, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { Product } from './entities/product.entity.js';
import { ProductStock } from './entities/product-stock.entity.js';
import { Category } from '#modules/categories/entities/category.entity.js';
import { Supplier } from '#modules/suppliers/entities/supplier.entity.js';
import { StockMovement } from '#modules/inventory/entities/stock-movement.entity.js';
import { ProductUnit } from '#common/enums/domain.enums.js';

/**
 * Pruebas del servicio de productos (RF-09 a RF-13).
 *
 * El caso crítico es RF-13: la creación con stock inicial debe insertar el
 * `stock_movement` ANTES de actualizar la cantidad visible en `product_stock`
 * (regla innegociable #2 de AGENTS.md). Se verifica el orden real de las
 * llamadas dentro de la transacción simulada, no solo el resultado final.
 */

function makeProduct(overrides: Partial<Product> = {}): Product {
  return Object.assign(new Product(), {
    id: 1,
    sku: 'ABC-001',
    barcode: null,
    name: 'Producto de prueba',
    description: null,
    categoryId: 1,
    supplierId: null,
    unit: ProductUnit.UNIT,
    purchasePrice: '10.00',
    salePrice: '15.00',
    minStock: '0.000',
    isActive: true,
    ...overrides,
  });
}

describe('ProductsService', () => {
  let service: ProductsService;
  let productFindOneBy: ReturnType<typeof vi.fn>;
  let productFindOne: ReturnType<typeof vi.fn>;
  let productSave: ReturnType<typeof vi.fn>;
  let categoryFindOneBy: ReturnType<typeof vi.fn>;
  let supplierFindOneBy: ReturnType<typeof vi.fn>;
  let transaction: ReturnType<typeof vi.fn>;
  let calls: string[];
  let productQueryBuilder: ReturnType<typeof vi.fn>;
  let getManyAndCount: ReturnType<typeof vi.fn>;
  let getRawMany: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    productFindOneBy = vi.fn().mockResolvedValue(null); // sku/barcode disponibles por defecto
    productFindOne = vi.fn().mockResolvedValue(makeProduct());
    productSave = vi.fn().mockImplementation((entity: Product) => Promise.resolve(entity));
    categoryFindOneBy = vi.fn().mockResolvedValue({ id: 1 }); // la categoría existe por defecto
    supplierFindOneBy = vi.fn().mockResolvedValue({ id: 1 });

    getManyAndCount = vi.fn().mockResolvedValue([[makeProduct()], 1]);
    getRawMany = vi.fn().mockResolvedValue([
      {
        id: '1',
        sku: 'ABC-001',
        barcode: null,
        name: 'Producto',
        unit: ProductUnit.UNIT,
        salePrice: '15.00',
        minStock: '5.000',
        quantityAvailable: '2.000',
      },
    ]);
    const queryBuilder: Record<string, ReturnType<typeof vi.fn>> = {
      leftJoinAndSelect: vi.fn(),
      leftJoin: vi.fn(),
      where: vi.fn(),
      andWhere: vi.fn(),
      orderBy: vi.fn(),
      addOrderBy: vi.fn(),
      select: vi.fn(),
      addSelect: vi.fn(),
      setParameters: vi.fn(),
      skip: vi.fn(),
      take: vi.fn(),
      limit: vi.fn(),
      getManyAndCount,
      getRawMany,
    };
    for (const key of Object.keys(queryBuilder)) {
      if (key !== 'getManyAndCount' && key !== 'getRawMany') {
        queryBuilder[key].mockReturnValue(queryBuilder);
      }
    }
    productQueryBuilder = vi.fn().mockReturnValue(queryBuilder);

    calls = [];
    let nextId = 100;

    const managerCreate = vi.fn((Entity: new () => object, data: object) =>
      Object.assign(new Entity(), data),
    );
    const managerSave = vi.fn((entity: Record<string, unknown>) => {
      if (entity instanceof Product) calls.push('save:Product');
      if (entity instanceof ProductStock) calls.push('save:ProductStock');
      if (entity instanceof StockMovement) calls.push('save:StockMovement');
      entity.id = entity.id ?? nextId++;
      return Promise.resolve(entity);
    });
    const managerUpdate = vi.fn((Entity: unknown) => {
      if (Entity === ProductStock) calls.push('update:ProductStock');
      return Promise.resolve();
    });
    const managerFindOneOrFail = vi.fn(() => Promise.resolve(makeProduct({ id: 1 })));

    transaction = vi.fn(async (callback: (manager: unknown) => Promise<unknown>) =>
      callback({
        create: managerCreate,
        save: managerSave,
        update: managerUpdate,
        findOneOrFail: managerFindOneOrFail,
      }),
    );

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: productFindOneBy,
            findOne: productFindOne,
            save: productSave,
            createQueryBuilder: productQueryBuilder,
          },
        },
        { provide: getRepositoryToken(Category), useValue: { findOneBy: categoryFindOneBy } },
        { provide: getRepositoryToken(Supplier), useValue: { findOneBy: supplierFindOneBy } },
        { provide: DataSource, useValue: { transaction } },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  describe('create', () => {
    it('crea el producto sin stock cuando no se pide stock inicial', async () => {
      const result = await service.create({
        sku: 'ABC-001',
        name: 'Producto',
        categoryId: 1,
        unit: ProductUnit.UNIT,
        purchasePrice: 10,
        salePrice: 15,
        userId: 1,
      });

      expect(result).toBeInstanceOf(Product);
      expect(calls).toEqual(['save:Product']);
    });

    it('RF-13: inserta el stock_movement ANTES de actualizar la cantidad de product_stock', async () => {
      await service.create({
        sku: 'ABC-002',
        name: 'Producto con stock',
        categoryId: 1,
        unit: ProductUnit.UNIT,
        purchasePrice: 10,
        salePrice: 15,
        branchId: 1,
        initialStock: 50,
        userId: 1,
      });

      expect(calls).toEqual([
        'save:Product',
        'save:ProductStock',
        'save:StockMovement',
        'update:ProductStock',
      ]);
    });

    it('no crea stock si branchId viene sin initialStock', async () => {
      await service.create({
        sku: 'ABC-003',
        name: 'Producto sin cantidad',
        categoryId: 1,
        unit: ProductUnit.UNIT,
        purchasePrice: 10,
        salePrice: 15,
        branchId: 1,
        userId: 1,
      });

      expect(calls).toEqual(['save:Product']);
    });

    it('rechaza un SKU duplicado con 409 antes de abrir la transacción', async () => {
      productFindOneBy.mockResolvedValueOnce(makeProduct());

      await expect(
        service.create({
          sku: 'ABC-001',
          name: 'Duplicado',
          categoryId: 1,
          unit: ProductUnit.UNIT,
          purchasePrice: 10,
          salePrice: 15,
          userId: 1,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(transaction).not.toHaveBeenCalled();
    });

    it('rechaza una categoría inexistente con 404 antes de abrir la transacción', async () => {
      categoryFindOneBy.mockResolvedValueOnce(null);

      await expect(
        service.create({
          sku: 'ABC-004',
          name: 'Sin categoría',
          categoryId: 999,
          unit: ProductUnit.UNIT,
          purchasePrice: 10,
          salePrice: 15,
          userId: 1,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(transaction).not.toHaveBeenCalled();
    });

    it('rechaza un precio de venta no mayor al de compra antes de abrir la transacción', async () => {
      await expect(
        service.create({
          sku: 'ABC-005',
          name: 'Precio inválido',
          categoryId: 1,
          unit: ProductUnit.UNIT,
          purchasePrice: 10,
          salePrice: 10,
          userId: 1,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(transaction).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('actualiza los campos indicados y deja el resto intacto', async () => {
      const result = await service.update(1, { name: 'Nuevo nombre' });

      expect(result.name).toBe('Nuevo nombre');
      expect(result.sku).toBe('ABC-001');
      expect(productSave).toHaveBeenCalled();
    });

    it('valida la nueva categoría cuando cambia', async () => {
      await service.update(1, { categoryId: 2 });
      expect(categoryFindOneBy).toHaveBeenCalledWith({ id: 2 });
    });

    it('rechaza una nueva categoría que no existe con 404', async () => {
      categoryFindOneBy.mockResolvedValueOnce(null);

      await expect(service.update(1, { categoryId: 999 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('valida el nuevo proveedor cuando cambia, salvo que se limpie a null', async () => {
      await service.update(1, { supplierId: 5 });
      expect(supplierFindOneBy).toHaveBeenCalledWith({ id: 5 });

      supplierFindOneBy.mockClear();
      const result = await service.update(1, { supplierId: null });
      expect(supplierFindOneBy).not.toHaveBeenCalled();
      expect(result.supplierId).toBeNull();
    });

    it('rechaza un nuevo proveedor que no existe con 404', async () => {
      supplierFindOneBy.mockResolvedValueOnce(null);

      await expect(service.update(1, { supplierId: 999 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('valida el SKU disponible cuando cambia', async () => {
      await service.update(1, { sku: 'NUEVO-SKU' });
      expect(productFindOneBy).toHaveBeenCalledWith({ sku: 'NUEVO-SKU' });
    });

    it('rechaza un SKU ya tomado por otro producto con 409', async () => {
      productFindOneBy.mockResolvedValueOnce(makeProduct({ id: 2, sku: 'TOMADO' }));

      await expect(service.update(1, { sku: 'TOMADO' })).rejects.toBeInstanceOf(ConflictException);
    });

    it('valida el código de barras disponible cuando cambia a uno no vacío', async () => {
      await service.update(1, { barcode: 'NUEVO-BARCODE' });
      expect(productFindOneBy).toHaveBeenCalledWith({ barcode: 'NUEVO-BARCODE' });
    });

    it('permite limpiar el código de barras a null sin validar disponibilidad', async () => {
      const result = await service.update(1, { barcode: null });
      expect(productFindOneBy).not.toHaveBeenCalledWith(expect.objectContaining({ barcode: null }));
      expect(result.barcode).toBeNull();
    });

    it('rechaza un precio de venta no mayor al de compra al cambiar solo uno de los dos', async () => {
      await expect(service.update(1, { salePrice: 5 })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('actualiza el stock mínimo y el estado activo', async () => {
      const result = await service.update(1, { minStock: 20, isActive: false });

      expect(result.minStock).toBe('20.000');
      expect(result.isActive).toBe(false);
    });

    it('lanza 404 si el producto no existe', async () => {
      productFindOne.mockResolvedValueOnce(null);

      await expect(service.update(999, { name: 'No existe' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('devuelve una página con los datos y el total, aplicando los filtros', async () => {
      const result = await service.findAll({
        search: 'coca',
        categoryId: 1,
        supplierId: 2,
        isActive: true,
      });

      expect(getManyAndCount).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('funciona sin filtros', async () => {
      const result = await service.findAll({});
      expect(result.total).toBe(1);
    });
  });

  describe('autocomplete', () => {
    it('devuelve la forma mínima para el POS, con isLowStock calculado', async () => {
      const result = await service.autocomplete('coca', 1, 10);

      expect(getRawMany).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 1,
          sku: 'ABC-001',
          barcode: null,
          name: 'Producto',
          unit: ProductUnit.UNIT,
          salePrice: '15.00',
          quantityAvailable: '2.000',
          isLowStock: true,
        },
      ]);
    });

    it('marca isLowStock cuando la cantidad disponible es menor o igual al mínimo', async () => {
      getRawMany.mockResolvedValueOnce([
        {
          id: '1',
          sku: 'ABC-001',
          barcode: null,
          name: 'Producto',
          unit: ProductUnit.UNIT,
          salePrice: '15.00',
          minStock: '5.000',
          quantityAvailable: '5.000',
        },
      ]);

      const result = await service.autocomplete('coca', 1);

      expect(result[0].isLowStock).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('desactiva el producto sin borrarlo (RF-12)', async () => {
      const product = makeProduct();
      const findOne = vi.fn().mockResolvedValue(product);
      const save = vi.fn().mockImplementation((p: Product) => Promise.resolve(p));

      const moduleRef = await Test.createTestingModule({
        providers: [
          ProductsService,
          {
            provide: getRepositoryToken(Product),
            useValue: { findOne, save, findOneBy: vi.fn(), createQueryBuilder: vi.fn() },
          },
          { provide: getRepositoryToken(Category), useValue: { findOneBy: vi.fn() } },
          { provide: getRepositoryToken(Supplier), useValue: { findOneBy: vi.fn() } },
          { provide: DataSource, useValue: { transaction: vi.fn() } },
        ],
      }).compile();
      const localService = moduleRef.get(ProductsService);

      await localService.deactivate(1);

      expect(product.isActive).toBe(false);
      expect(save).toHaveBeenCalledWith(product);
    });
  });
});
