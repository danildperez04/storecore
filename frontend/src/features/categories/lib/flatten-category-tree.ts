import type { Category } from '../services/categories.service';

export interface FlatCategory {
  category: Category;
  depth: number;
}

/** Aplana el árbol de categorías a una lista con su profundidad, para listas e indentación. */
export function flattenCategoryTree(categories: Category[], depth = 0): FlatCategory[] {
  return categories.flatMap((category) => [
    { category, depth },
    ...flattenCategoryTree(category.children ?? [], depth + 1),
  ]);
}

/** Identificadores de una categoría y todos sus descendientes (para excluirlos como padre de sí misma). */
export function collectDescendantIds(category: Category): Set<number> {
  const ids = new Set<number>([category.id]);
  for (const child of category.children ?? []) {
    for (const id of collectDescendantIds(child)) ids.add(id);
  }
  return ids;
}
