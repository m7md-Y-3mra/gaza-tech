import type { SupabaseClient } from '@supabase/supabase-js';
import CustomError from '@/utils/CustomError';
import type {
  MarketplaceCategory,
  Location,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateLocationInput,
  UpdateLocationInput,
} from './types';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(
  supabase: SupabaseClient
): Promise<MarketplaceCategory[]> {
  const { data, error } = await supabase
    .from('marketplace_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new CustomError({ message: error.message });
  }

  return data ?? [];
}

export async function checkCategoryInUse(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('marketplace_listings')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (error) {
    throw new CustomError({ message: error.message });
  }

  return (count ?? 0) > 0;
}

export async function createCategory(
  supabase: SupabaseClient,
  input: CreateCategoryInput
): Promise<MarketplaceCategory> {
  const slug = generateSlug(input.name);

  const { data, error } = await supabase
    .from('marketplace_categories')
    .insert({
      name: input.name,
      name_ar: input.name_ar,
      slug,
      description: input.description ?? null,
      icon_url: input.icon_url ?? null,
      parent_id: input.parent_id ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new CustomError({ message: error.message });
  }

  return data;
}

export async function updateCategory(
  supabase: SupabaseClient,
  id: string,
  input: UpdateCategoryInput
): Promise<MarketplaceCategory> {
  const updates: Record<string, unknown> = { ...input };

  if (input.name) {
    updates.slug = generateSlug(input.name);
  }

  const { data, error } = await supabase
    .from('marketplace_categories')
    .update(updates)
    .eq('marketplace_category_id', id)
    .select('*')
    .single();

  if (error) {
    throw new CustomError({ message: error.message });
  }

  return data;
}

export async function deleteCategory(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('marketplace_categories')
    .delete()
    .eq('marketplace_category_id', id);

  if (error) {
    throw new CustomError({ message: error.message });
  }
}

// ─── Locations ────────────────────────────────────────────────────────────────

export async function getLocations(
  supabase: SupabaseClient
): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false });

  if (error) {
    throw new CustomError({ message: error.message });
  }

  return data ?? [];
}

export async function checkLocationInUse(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('marketplace_listings')
    .select('*', { count: 'exact', head: true })
    .eq('location_id', id);

  if (error) {
    throw new CustomError({ message: error.message });
  }

  return (count ?? 0) > 0;
}

export async function createLocation(
  supabase: SupabaseClient,
  input: CreateLocationInput
): Promise<Location> {
  const slug = generateSlug(input.name);

  const { data, error } = await supabase
    .from('locations')
    .insert({
      name: input.name,
      name_ar: input.name_ar,
      slug,
      sort_order: input.sort_order ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new CustomError({ message: error.message });
  }

  return data;
}

export async function updateLocation(
  supabase: SupabaseClient,
  id: string,
  input: UpdateLocationInput
): Promise<Location> {
  const updates: Record<string, unknown> = { ...input };

  if (input.name) {
    updates.slug = generateSlug(input.name);
  }

  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('location_id', id)
    .select('*')
    .single();

  if (error) {
    throw new CustomError({ message: error.message });
  }

  return data;
}

export async function deleteLocation(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('location_id', id);

  if (error) {
    throw new CustomError({ message: error.message });
  }
}
