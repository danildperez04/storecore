export interface CreateBranchInput {
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
}

export interface UpdateBranchInput extends Partial<CreateBranchInput> {
  isActive?: boolean;
}
