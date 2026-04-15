export interface MarketplaceCategory {
  marketplace_category_id: string;
  name: string;
  name_ar: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  location_id: string;
  name: string;
  name_ar: string;
  slug: string;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  name_ar: string;
  description?: string;
  icon_url?: string;
  parent_id?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  name_ar?: string;
  description?: string;
  icon_url?: string;
  parent_id?: string | null;
  is_active?: boolean;
}

export interface CreateLocationInput {
  name: string;
  name_ar: string;
  sort_order?: number;
}

export interface UpdateLocationInput {
  name?: string;
  name_ar?: string;
  sort_order?: number | null;
  is_active?: boolean;
}
