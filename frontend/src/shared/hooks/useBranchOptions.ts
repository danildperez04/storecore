import { useQuery } from '@tanstack/react-query';
import { api } from '@/app/services/api';

export interface BranchOption {
  id: number;
  code: string;
  name: string;
}

interface PaginatedBranches {
  data: BranchOption[];
}

/** Sucursales activas, para selectores (p. ej. el stock inicial de un producto, RF-13). */
export function useBranchOptions() {
  return useQuery({
    queryKey: ['branches', 'options'],
    queryFn: async (): Promise<BranchOption[]> => {
      const { data } = await api.get<PaginatedBranches>('/branches', {
        params: { isActive: true, limit: 100 },
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}
