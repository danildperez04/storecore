import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/app/services/api';
import type { SupplierInput } from '../schemas/supplier.schema';

export interface Supplier {
  id: number;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Catálogo de proveedores con filtros y paginación (RF-08, RF-11). */
export function useSuppliers(filters: SupplierFilters = {}) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async (): Promise<PaginatedResponse<Supplier>> => {
      const { data } = await api.get<PaginatedResponse<Supplier>>('/suppliers', {
        params: filters,
      });
      return data;
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SupplierInput): Promise<Supplier> => {
      const { data } = await api.post<Supplier>('/suppliers', input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: Partial<SupplierInput>;
    }): Promise<Supplier> => {
      const { data } = await api.patch<Supplier>(`/suppliers/${id}`, input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

/** Borrado lógico (RF-08). No elimina la fila: la oculta de los listados activos. */
export function useDeactivateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/suppliers/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}
