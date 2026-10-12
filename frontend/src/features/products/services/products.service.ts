import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/services/api';
import type { Category } from '@/features/categories/services/categories.service';
import type { Supplier } from '@/features/suppliers/services/suppliers.service';
import type { ProductInput } from '../schemas/product.schema';

export interface Product {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  categoryId: number;
  category: Category;
  supplierId: number | null;
  supplier: Supplier | null;
  unit: 'UNIT' | 'KG' | 'LT';
  purchasePrice: string;
  salePrice: string;
  minStock: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  supplierId?: number;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Catálogo de productos con búsqueda, filtros y paginación server-side (RF-11). */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      const { data } = await api.get<PaginatedResponse<Product>>('/products', { params: filters });
      return data;
    },
    placeholderData: (previous) => previous,
  });
}

/** Crea un producto, con stock inicial opcional por sucursal (RF-09, RF-13). */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput): Promise<Product> => {
      const { data } = await api.post<Product>('/products', input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: Partial<ProductInput>;
    }): Promise<Product> => {
      const { data } = await api.patch<Product>(`/products/${id}`, input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

/** Borrado lógico (RF-12). No elimina la fila: la oculta de los listados activos. */
export function useDeactivateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
