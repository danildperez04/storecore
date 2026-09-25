import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity.js';
import type { CreateBranchInput, UpdateBranchInput } from './branches.types.js';

/**
 * Servicio de sucursales.
 *
 * Una sucursal con historial (usuarios, ventas, órdenes o cajas) no se borra:
 * se desactiva. Borrarla dejaría ventas sin referencia (RN-8).
 */
@Injectable()
export class BranchesService {
  constructor(
    @Inject(getRepositoryToken(Branch)) private readonly repository: Repository<Branch>,
  ) {}

  async create(input: CreateBranchInput): Promise<Branch> {
    const existing = await this.repository.findOneBy({ code: input.code });
    if (existing) {
      throw new ConflictException(`Ya existe una sucursal con el código "${input.code}".`);
    }
    const branch = this.repository.create({
      code: input.code,
      name: input.name,
      address: input.address,
      phone: input.phone,
      isActive: true,
    });
    return this.repository.save(branch);
  }

  async findOneOrFail(id: number): Promise<Branch> {
    const branch = await this.repository.findOneBy({ id });
    if (!branch) throw new NotFoundException(`No existe la sucursal ${id}.`);
    return branch;
  }

  async update(id: number, input: UpdateBranchInput): Promise<Branch> {
    const branch = await this.findOneOrFail(id);

    if (input.code && input.code !== branch.code) {
      const taken = await this.repository.findOneBy({ code: input.code });
      if (taken)
        throw new ConflictException(`Ya existe una sucursal con el código "${input.code}".`);
    }

    Object.assign(branch, {
      ...input,
      address: input.address === undefined ? branch.address : input.address,
      phone: input.phone === undefined ? branch.phone : input.phone,
    });
    return this.repository.save(branch);
  }

  async deactivate(id: number): Promise<void> {
    const branch = await this.findOneOrFail(id);
    branch.isActive = false;
    await this.repository.save(branch);
  }
}
