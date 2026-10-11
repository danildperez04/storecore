export interface CreateCategoryInput {
  name: string;
  parentId?: number | null;
  icon?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: number | null;
  icon?: string | null;
  isActive?: boolean;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  parentId?: number;
  rootsOnly?: boolean;
}
