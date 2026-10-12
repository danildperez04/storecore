import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/services/api';
import type { CategoryInput } from '../schemas/category.schema';

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  icon: string | null;
  isActive: boolean;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: number;
  rootsOnly?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Catálogo de categorías con filtros y paginación (RF-07, RF-11). */
export function useCategories(filters: CategoryFilters = {}) {
  return useQuery({
    queryKey: ['categories', filters],
    queryFn: async (): Promise<PaginatedResponse<Category>> => {
      const { data } = await api.get<PaginatedResponse<Category>>('/categories', {
        params: filters,
      });
      return data;
    },
  });
}

/** Árbol completo, para el selector jerárquico de categoría padre. */
export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: async (): Promise<Category[]> => {
      const { data } = await api.get<Category[]>('/categories/tree');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CategoryInput): Promise<Category> => {
      const { data } = await api.post<Category>('/categories', input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: Partial<CategoryInput>;
    }): Promise<Category> => {
      const { data } = await api.patch<Category>(`/categories/${id}`, input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

/** Borrado lógico (RF-07). No elimina la fila: la oculta de los listados activos. */
export function useDeactivateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}
