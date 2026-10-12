import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity.js';
import type {
  CreateSupplierInput,
  SupplierFilters,
  UpdateSupplierInput,
} from './suppliers.types.js';
import { PaginatedResponse } from '#common/dto/pagination.dto.js';

/**
 * Servicio de proveedores.
 *
 * El esquema no exige nombre único: dos proveedores reales pueden compartir
 * nombre comercial (p. ej. dos repartidores distintos de la misma marca), así
 * que no se agrega aquí una restricción de unicidad que ni el PRD (RF-08) ni
 * la migración piden. Un proveedor con historial (productos u órdenes) no se
 * borra: se desactiva (RN-8).
 */
@Injectable()
export class SuppliersService {
  constructor(
    @Inject(getRepositoryToken(Supplier)) private readonly repository: Repository<Supplier>,
  ) {}

  async findAll(filters: SupplierFilters): Promise<PaginatedResponse<Supplier>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const query = this.repository.createQueryBuilder('supplier');
    if (filters.isActive !== undefined) {
      query.andWhere('supplier.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.search) {
      query.andWhere('supplier.name ILIKE :search', { search: `%${filters.search}%` });
    }

    const [data, total] = await query
      .orderBy('supplier.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponse(data, total, page, limit);
  }

  async findOneOrFail(id: number): Promise<Supplier> {
    const supplier = await this.repository.findOneBy({ id });
    if (!supplier) throw new NotFoundException(`No existe el proveedor ${id}.`);
    return supplier;
  }

  async create(input: CreateSupplierInput): Promise<Supplier> {
    const supplier = this.repository.create({
      name: input.name,
      contactName: input.contactName ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
      isActive: true,
    });
    return this.repository.save(supplier);
  }

  async update(id: number, input: UpdateSupplierInput): Promise<Supplier> {
    const supplier = await this.findOneOrFail(id);

    Object.assign(supplier, {
      name: input.name ?? supplier.name,
      contactName: input.contactName === undefined ? supplier.contactName : input.contactName,
      phone: input.phone === undefined ? supplier.phone : input.phone,
      email: input.email === undefined ? supplier.email : input.email,
      address: input.address === undefined ? supplier.address : input.address,
      notes: input.notes === undefined ? supplier.notes : input.notes,
      isActive: input.isActive === undefined ? supplier.isActive : input.isActive,
    });
    return this.repository.save(supplier);
  }

  async deactivate(id: number): Promise<void> {
    const supplier = await this.findOneOrFail(id);
    supplier.isActive = false;
    await this.repository.save(supplier);
  }
}
