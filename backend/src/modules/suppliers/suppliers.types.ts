export interface CreateSupplierInput {
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  isActive?: boolean;
}

export interface SupplierFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
