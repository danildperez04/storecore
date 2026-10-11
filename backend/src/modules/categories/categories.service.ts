import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import type {
  CategoryFilters,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.types.js';
import { PaginatedResponse } from '#common/dto/pagination.dto.js';

/** Límite defensivo contra datos corruptos; una tienda real no tiene 50 niveles. */
const MAX_HIERARCHY_DEPTH = 50;

/**
 * Servicio de categorías.
 *
 * Una categoría con subcategorías o productos activos no se borra: se desactiva
 * (RN-8). La jerarquía se valida contra ciclos en el service, no en la base de
 * datos: el esquema solo tiene una FK simple `parent_id` (RF-07).
 */
@Injectable()
export class CategoriesService {
  constructor(
    @Inject(getRepositoryToken(Category)) private readonly repository: Repository<Category>,
  ) {}

  async findAll(filters: CategoryFilters): Promise<PaginatedResponse<Category>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const query = this.repository.createQueryBuilder('category');
    if (filters.isActive !== undefined) {
      query.andWhere('category.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.search) {
      query.andWhere('category.name ILIKE :search', { search: `%${filters.search}%` });
    }
    if (filters.rootsOnly) {
      query.andWhere('category.parentId IS NULL');
    } else if (filters.parentId !== undefined) {
      query.andWhere('category.parentId = :parentId', { parentId: filters.parentId });
    }

    const [data, total] = await query
      .orderBy('category.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponse(data, total, page, limit);
  }

  /**
   * Árbol completo, para el selector jerárquico del frontend.
   *
   * Se construye a mano a partir de una consulta plana: `TreeRepository.find
   * Trees()` de TypeORM solo soporta las estrategias `closure-table`,
   * `nested-set` y `materialized-path` — con `adjacency-list` (la que usa esta
   * entidad) lanza `TypeORMError: Supported only in tree entities`. No hay
   * nada que configurar distinto; ese método simplemente no existe para esta
   * estrategia, así que el árbol se arma aquí.
   */
  async findTree(): Promise<Category[]> {
    const categories = await this.repository.find({ order: { name: 'ASC' } });
    const byId = new Map(categories.map((category) => [category.id, category]));

    const roots: Category[] = [];
    for (const category of categories) category.children = [];
    for (const category of categories) {
      if (category.parentId === null) {
        roots.push(category);
      } else {
        byId.get(category.parentId)?.children.push(category);
      }
    }
    return roots;
  }

  async findOneOrFail(id: number): Promise<Category> {
    const category = await this.repository.findOneBy({ id });
    if (!category) throw new NotFoundException(`No existe la categoría ${id}.`);
    return category;
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    if (input.parentId !== undefined && input.parentId !== null) {
      const parent = await this.repository.findOneBy({ id: input.parentId });
      if (!parent) throw new NotFoundException('La categoría padre no existe.');
    }

    const slug = await this.generateSlug(input.name);
    const category = this.repository.create({
      name: input.name,
      slug,
      parentId: input.parentId ?? null,
      icon: input.icon ?? null,
      isActive: true,
    });
    return this.repository.save(category);
  }

  async update(id: number, input: UpdateCategoryInput): Promise<Category> {
    const category = await this.findOneOrFail(id);

    if (input.parentId !== undefined && input.parentId !== category.parentId) {
      if (input.parentId !== null) {
        const parent = await this.repository.findOneBy({ id: input.parentId });
        if (!parent) throw new NotFoundException('La categoría padre no existe.');
        await this.assertNoCycle(id, input.parentId);
      }
      category.parentId = input.parentId;
    }

    if (input.name !== undefined && input.name !== category.name) {
      category.name = input.name;
      category.slug = await this.generateSlug(input.name, id);
    }

    if (input.icon !== undefined) category.icon = input.icon;
    if (input.isActive !== undefined) category.isActive = input.isActive;

    return this.repository.save(category);
  }

  async deactivate(id: number): Promise<void> {
    const category = await this.findOneOrFail(id);
    category.isActive = false;
    await this.repository.save(category);
  }

  /**
   * Camina hacia arriba desde `newParentId` siguiendo `parentId` hasta `null`.
   * Si se encuentra `categoryId` en el camino, asignarlo como padre crearía un
   * ciclo. Se prefiere este recorrido manual sobre `TreeRepository.findDescendants`
   * porque esa API trae el árbol completo a memoria para resolver "dame el
   * subárbol de X" — útil para `findTree()`, pero indirecto para la pregunta
   * puntual "¿este movimiento crea un ciclo?".
   */
  private async assertNoCycle(categoryId: number, newParentId: number): Promise<void> {
    let currentId: number | null = newParentId;
    let depth = 0;
    while (currentId !== null) {
      if (currentId === categoryId) {
        throw new BadRequestException(
          'No se puede asignar como padre una subcategoría de sí misma.',
        );
      }
      if (++depth > MAX_HIERARCHY_DEPTH) {
        throw new BadRequestException('La jerarquía de categorías es demasiado profunda.');
      }
      const parent: Category | null = await this.repository.findOneBy({ id: currentId });
      currentId = parent?.parentId ?? null;
    }
  }

  /** Genera un slug a partir del nombre; agrega un sufijo numérico si colisiona. */
  private async generateSlug(name: string, excludeId?: number): Promise<string> {
    const base = name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = base;
    let suffix = 1;
    while (true) {
      const existing = await this.repository.findOneBy({ slug });
      if (!existing || existing.id === excludeId) return slug;
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
  }
}
