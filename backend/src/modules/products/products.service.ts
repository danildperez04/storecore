import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { ProductStock } from './entities/product-stock.entity.js';
import type {
  CreateProductInput,
  ProductAutocompleteResult,
  ProductFilters,
  UpdateProductInput,
} from './products.types.js';
import { Category } from '#modules/categories/entities/category.entity.js';
import { Supplier } from '#modules/suppliers/entities/supplier.entity.js';
import { StockMovement } from '#modules/inventory/entities/stock-movement.entity.js';
import { StockMovementType } from '#common/enums/domain.enums.js';
import { PaginatedResponse } from '#common/dto/pagination.dto.js';

/**
 * Servicio de productos.
 *
 * La creación con stock inicial (RF-13/HU-19) es la primera transacción real
 * del proyecto: inserta el producto, la fila de `product_stock` en 0 y el
 * `stock_movement` tipo INITIAL, en ese orden, antes de fijar la cantidad
 * visible — el stock nunca cambia sin el movimiento que lo explica (RN-3).
 */
@Injectable()
export class ProductsService {
  constructor(
    @Inject(getRepositoryToken(Product)) private readonly productRepo: Repository<Product>,
    @Inject(getRepositoryToken(Category)) private readonly categoryRepo: Repository<Category>,
    @Inject(getRepositoryToken(Supplier)) private readonly supplierRepo: Repository<Supplier>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier');

    if (filters.isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.categoryId !== undefined) {
      query.andWhere('product.categoryId = :categoryId', { categoryId: filters.categoryId });
    }
    if (filters.supplierId !== undefined) {
      query.andWhere('product.supplierId = :supplierId', { supplierId: filters.supplierId });
    }
    if (filters.search) {
      // `idx_product_name`, `idx_product_category_id` y los indices unicos de
      // sku/barcode son btree simples (ver la migracion inicial); un ILIKE
      // '%texto%' no los aprovecha y hace sequential scan en los tres campos.
      // Aceptable al volumen de un abarrotes; revisar si el catalogo crece
      // mucho (un indice GIN con pg_trgm aceleraria esta busqueda parcial).
      query.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('product.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponse(data, total, page, limit);
  }

  async findOneOrFail(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true, supplier: true },
    });
    if (!product) throw new NotFoundException(`No existe el producto ${id}.`);
    return product;
  }

  async create(input: CreateProductInput): Promise<Product> {
    await this.assertCategoryExists(input.categoryId);
    if (input.supplierId) await this.assertSupplierExists(input.supplierId);
    await this.assertSkuAvailable(input.sku);
    if (input.barcode) await this.assertBarcodeAvailable(input.barcode);
    this.assertValidPrices(input.purchasePrice, input.salePrice);

    return this.dataSource.transaction(async (manager) => {
      const product = await manager.save(
        manager.create(Product, {
          sku: input.sku,
          barcode: input.barcode ?? null,
          name: input.name,
          description: input.description ?? null,
          categoryId: input.categoryId,
          supplierId: input.supplierId ?? null,
          unit: input.unit,
          purchasePrice: input.purchasePrice.toFixed(2),
          salePrice: input.salePrice.toFixed(2),
          minStock: (input.minStock ?? 0).toFixed(3),
          isActive: true,
        }),
      );

      if (input.branchId && input.initialStock && input.initialStock > 0) {
        // Nace en 0 y el movimiento explica el salto (mismo patrón del
        // seeder, ver database/seeders/index.ts), para que el kardex nunca
        // muestre una existencia sin movimiento que la respalde (RN-3,
        // RNF-04).
        //
        // No requiere SELECT ... FOR UPDATE: la fila de product_stock nace en
        // esta misma transacción, no hay ningún lector concurrente posible
        // sobre ella todavía. El bloqueo que exige AGENTS.md (regla 3)
        // protege operaciones sobre una fila PREEXISTENTE (venta, ajuste —
        // Sprint 2 en adelante), no la creación de una fila nueva dentro de
        // su propia transacción.
        const stock = await manager.save(
          manager.create(ProductStock, {
            productId: product.id,
            branchId: input.branchId,
            quantity: '0',
          }),
        );

        await manager.save(
          manager.create(StockMovement, {
            productId: product.id,
            branchId: input.branchId,
            type: StockMovementType.INITIAL,
            quantity: input.initialStock.toFixed(3),
            reason: 'Carga inicial de catálogo',
            reference: null,
            previousQuantity: '0',
            newQuantity: input.initialStock.toFixed(3),
            userId: input.userId,
          }),
        );

        await manager.update(ProductStock, stock.id, {
          quantity: input.initialStock.toFixed(3),
        });
      }

      return manager.findOneOrFail(Product, {
        where: { id: product.id },
        relations: { category: true, supplier: true },
      });
    });
  }

  async update(id: number, input: UpdateProductInput): Promise<Product> {
    const product = await this.findOneOrFail(id);

    if (input.categoryId !== undefined && input.categoryId !== product.categoryId) {
      await this.assertCategoryExists(input.categoryId);
    }
    if (input.supplierId !== undefined && input.supplierId !== product.supplierId) {
      if (input.supplierId !== null) await this.assertSupplierExists(input.supplierId);
    }
    if (input.sku !== undefined && input.sku !== product.sku) {
      await this.assertSkuAvailable(input.sku);
    }
    if (input.barcode !== undefined && input.barcode !== product.barcode && input.barcode) {
      await this.assertBarcodeAvailable(input.barcode);
    }

    const purchasePrice = input.purchasePrice ?? Number(product.purchasePrice);
    const salePrice = input.salePrice ?? Number(product.salePrice);
    this.assertValidPrices(purchasePrice, salePrice);

    Object.assign(product, {
      sku: input.sku ?? product.sku,
      barcode: input.barcode === undefined ? product.barcode : input.barcode,
      name: input.name ?? product.name,
      description: input.description === undefined ? product.description : input.description,
      categoryId: input.categoryId ?? product.categoryId,
      supplierId: input.supplierId === undefined ? product.supplierId : input.supplierId,
      unit: input.unit ?? product.unit,
      purchasePrice: purchasePrice.toFixed(2),
      salePrice: salePrice.toFixed(2),
      minStock: input.minStock === undefined ? product.minStock : input.minStock.toFixed(3),
      isActive: input.isActive === undefined ? product.isActive : input.isActive,
    });

    return this.productRepo.save(product);
  }

  async deactivate(id: number): Promise<void> {
    // No se valida "tiene ventas" porque el módulo `sales` no existe todavía
    // (Sprint 3). El método queda listo para que esa validación se agregue
    // sin romper la firma pública (RN-8).
    const product = await this.findOneOrFail(id);
    product.isActive = false;
    await this.productRepo.save(product);
  }

  /** Contrato fijado en Sprint 1 (RF-11/HU-17); su consumidor real es el POS (Sprint 3). */
  async autocomplete(
    search: string,
    branchId: number | null,
    limit = 10,
  ): Promise<ProductAutocompleteResult[]> {
    const rows = await this.productRepo
      .createQueryBuilder('product')
      .leftJoin(
        ProductStock,
        'stock',
        'stock.productId = product.id AND stock.branchId = :branchId',
      )
      .where('product.isActive = true')
      .andWhere('(product.name ILIKE :like OR product.sku = :exact OR product.barcode = :exact)')
      .orderBy('CASE WHEN product.sku = :exact OR product.barcode = :exact THEN 0 ELSE 1 END')
      .addOrderBy('product.name', 'ASC')
      .select('product.id', 'id')
      .addSelect('product.sku', 'sku')
      .addSelect('product.barcode', 'barcode')
      .addSelect('product.name', 'name')
      .addSelect('product.unit', 'unit')
      .addSelect('product.salePrice', 'salePrice')
      .addSelect('product.minStock', 'minStock')
      .addSelect('COALESCE(stock.quantity, 0)', 'quantityAvailable')
      .setParameters({ branchId, like: `%${search}%`, exact: search })
      .limit(limit)
      .getRawMany();

    return rows.map((row) => ({
      id: Number(row.id),
      sku: row.sku as string,
      barcode: (row.barcode as string | null) ?? null,
      name: row.name as string,
      unit: row.unit,
      salePrice: row.salePrice as string,
      quantityAvailable: row.quantityAvailable as string,
      isLowStock: Number(row.quantityAvailable) <= Number(row.minStock),
    }));
  }

  /**
   * Defensa en profundidad: el DTO ya valida esto con `@IsGreaterThanProperty`,
   * pero una actualización parcial puede traer solo uno de los dos precios —
   * el service es quien tiene ambos valores finales para comparar.
   */
  private assertValidPrices(purchasePrice: number, salePrice: number): void {
    if (salePrice <= purchasePrice) {
      throw new BadRequestException('El precio de venta debe ser mayor al precio de compra.');
    }
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const exists = await this.categoryRepo.findOneBy({ id: categoryId });
    if (!exists) throw new NotFoundException('La categoría no existe.');
  }

  private async assertSupplierExists(supplierId: number): Promise<void> {
    const exists = await this.supplierRepo.findOneBy({ id: supplierId });
    if (!exists) throw new NotFoundException('El proveedor no existe.');
  }

  private async assertSkuAvailable(sku: string): Promise<void> {
    const existing = await this.productRepo.findOneBy({ sku });
    if (existing) throw new ConflictException(`Ya existe un producto con el SKU "${sku}".`);
  }

  private async assertBarcodeAvailable(barcode: string): Promise<void> {
    const existing = await this.productRepo.findOneBy({ barcode });
    if (existing) {
      throw new ConflictException(`Ya existe un producto con el código de barras "${barcode}".`);
    }
  }
}
