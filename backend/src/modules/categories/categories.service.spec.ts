import { describe, expect, it, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { Category } from './entities/category.entity.js';

/**
 * Pruebas del servicio de categorías (RF-07, RN-8).
 *
 * El caso de mayor riesgo es la validación de ciclos en la jerarquía: la
 * entidad usa `parent_id` adjacency-list, sin protección automática de la
 * base de datos contra un ciclo, así que el service es la única barrera.
 */

function makeCategory(overrides: Partial<Category> = {}): Category {
  return Object.assign(new Category(), {
    id: 1,
    name: 'Bebidas',
    slug: 'bebidas',
    parentId: null,
    icon: null,
    isActive: true,
    ...overrides,
  });
}

describe('CategoriesService', () => {
  let service: CategoriesService;
  let findOneBy: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;

  let getManyAndCount: ReturnType<typeof vi.fn>;
  let find: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findOneBy = vi.fn();
    save = vi.fn().mockImplementation((entity: Category) => {
      entity.id = entity.id ?? 99;
      return Promise.resolve(entity);
    });
    getManyAndCount = vi.fn().mockResolvedValue([[makeCategory()], 1]);
    find = vi.fn().mockResolvedValue([makeCategory()]);

    const queryBuilder = {
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOneBy,
            save,
            find,
            create: (data: unknown) => Object.assign(new Category(), data),
            createQueryBuilder: vi.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(CategoriesService);
  });

  describe('create', () => {
    it('crea una categoría raíz generando el slug a partir del nombre', async () => {
      findOneBy.mockResolvedValue(null);

      const result = await service.create({ name: 'Bebidas' });

      expect(result.slug).toBe('bebidas');
      expect(result.parentId).toBeNull();
    });

    it('crea una subcategoría cuando el padre existe', async () => {
      findOneBy
        .mockResolvedValueOnce(makeCategory({ id: 1 })) // el padre existe
        .mockResolvedValueOnce(null); // el slug no colisiona

      const result = await service.create({ name: 'Gaseosas', parentId: 1 });

      expect(result.parentId).toBe(1);
    });

    it('rechaza un parentId que no existe con 404', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.create({ name: 'Huérfana', parentId: 999 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update — ciclos de jerarquía', () => {
    it('rechaza un ciclo de un nivel (parentId igual al propio id)', async () => {
      const category = makeCategory({ id: 5 });
      findOneBy
        .mockResolvedValueOnce(category) // findOneOrFail(5)
        .mockResolvedValueOnce(category); // el "nuevo padre" (5) existe

      await expect(service.update(5, { parentId: 5 })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza un ciclo de dos niveles (mover una categoría bajo su propio nieto)', async () => {
      // Jerarquía real: A(1) es padre de B(2), B(2) es padre de C(3).
      // Se intenta mover A para que su padre sea C: eso es un ciclo.
      const a = makeCategory({ id: 1, name: 'A', parentId: null });
      const b = makeCategory({ id: 2, name: 'B', parentId: 1 });
      const c = makeCategory({ id: 3, name: 'C', parentId: 2 });

      findOneBy
        .mockResolvedValueOnce(a) // findOneOrFail(1)
        .mockResolvedValueOnce(c) // el "nuevo padre" (3) existe
        .mockResolvedValueOnce(c) // assertNoCycle: currentId=3 -> c (parentId=2)
        .mockResolvedValueOnce(b); // assertNoCycle: currentId=2 -> b (parentId=1 === categoryId)

      await expect(service.update(1, { parentId: 3 })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('permite mover una categoría a un padre que no es su descendiente', async () => {
      const a = makeCategory({ id: 1, name: 'A', parentId: null });
      const other = makeCategory({ id: 10, name: 'Otra', parentId: null });

      findOneBy
        .mockResolvedValueOnce(a) // findOneOrFail(1)
        .mockResolvedValueOnce(other) // el nuevo padre (10) existe
        .mockResolvedValueOnce(other); // assertNoCycle: currentId=10 -> other, sin padre, termina

      const result = await service.update(1, { parentId: 10 });

      expect(result.parentId).toBe(10);
    });

    it('rechaza un nuevo padre que no existe con 404', async () => {
      const a = makeCategory({ id: 1 });
      findOneBy
        .mockResolvedValueOnce(a) // findOneOrFail(1)
        .mockResolvedValueOnce(null); // el nuevo padre (999) no existe

      await expect(service.update(1, { parentId: 999 })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('devuelve una página con los datos y el total', async () => {
      const result = await service.findAll({ search: 'beb', isActive: true });

      expect(getManyAndCount).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findTree', () => {
    it('arma el árbol a mano a partir de una consulta plana (adjacency-list)', async () => {
      // `TreeRepository.findTrees()` de TypeORM no soporta adjacency-list;
      // por eso este método no debe depender de ella (ver nota en el service).
      const a = makeCategory({ id: 1, name: 'A', parentId: null });
      const b = makeCategory({ id: 2, name: 'B', parentId: 1 });
      const c = makeCategory({ id: 3, name: 'C', parentId: 1 });
      const d = makeCategory({ id: 4, name: 'D', parentId: 2 });
      find.mockResolvedValue([a, b, c, d]);

      const result = await service.findTree();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].children.map((child) => child.id).sort()).toEqual([2, 3]);
      const nodeB = result[0].children.find((child) => child.id === 2);
      expect(nodeB?.children.map((child) => child.id)).toEqual([4]);
    });

    it('devuelve una lista vacía cuando no hay categorías', async () => {
      find.mockResolvedValue([]);

      const result = await service.findTree();

      expect(result).toEqual([]);
    });
  });

  describe('update — otros campos', () => {
    it('regenera el slug cuando cambia el nombre', async () => {
      findOneBy
        .mockResolvedValueOnce(makeCategory({ name: 'Bebidas', slug: 'bebidas' })) // findOneOrFail
        .mockResolvedValueOnce(null); // el nuevo slug no colisiona

      const result = await service.update(1, { name: 'Refrescos' });

      expect(result.name).toBe('Refrescos');
      expect(result.slug).toBe('refrescos');
    });

    it('actualiza el icono y el estado activo', async () => {
      findOneBy.mockResolvedValue(makeCategory());

      const result = await service.update(1, { icon: 'bottle', isActive: false });

      expect(result.icon).toBe('bottle');
      expect(result.isActive).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('desactiva la categoría sin borrarla (RN-8)', async () => {
      const category = makeCategory();
      findOneBy.mockResolvedValue(category);

      await service.deactivate(1);

      expect(category.isActive).toBe(false);
      expect(save).toHaveBeenCalledWith(category);
    });

    it('lanza 404 si la categoría no existe', async () => {
      findOneBy.mockResolvedValue(null);

      await expect(service.deactivate(7)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
