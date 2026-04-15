'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { errorHandler } from '@/utils/error-handler';
import { requireRole } from '@/utils/rbac-handler';
import CustomError from '@/utils/CustomError';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateLocationSchema,
  UpdateLocationSchema,
} from './schema';
import {
  getCategories as getCategoriesQuery,
  getLocations as getLocationsQuery,
  createCategory,
  updateCategory,
  deleteCategory,
  checkCategoryInUse,
  createLocation,
  updateLocation,
  deleteLocation,
  checkLocationInUse,
} from './queries';
import type {
  MarketplaceCategory,
  Location,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateLocationInput,
  UpdateLocationInput,
} from './types';

// ─── Category Actions ─────────────────────────────────────────────────────────

export const getCategoriesAction = errorHandler(
  async (): Promise<MarketplaceCategory[]> => {
    await requireRole(['admin', 'moderator']);
    const supabase = await createClient();
    return getCategoriesQuery(supabase);
  }
);

export const createCategoryAction = errorHandler(
  async (input: CreateCategoryInput): Promise<MarketplaceCategory> => {
    await requireRole(['admin']);
    const validated = CreateCategorySchema.parse(input);
    const supabase = await createClient();
    const result = await createCategory(supabase, validated);
    revalidatePath('/dashboard/management');
    return result;
  }
);

export const updateCategoryAction = errorHandler(
  async (
    id: string,
    input: UpdateCategoryInput
  ): Promise<MarketplaceCategory> => {
    await requireRole(['admin']);
    const validated = UpdateCategorySchema.parse(input);
    const supabase = await createClient();
    const result = await updateCategory(supabase, id, validated);
    revalidatePath('/dashboard/management');
    return result;
  }
);

export const deleteCategoryAction = errorHandler(
  async (id: string): Promise<void> => {
    await requireRole(['admin']);
    const supabase = await createClient();

    const inUse = await checkCategoryInUse(supabase, id);
    if (inUse) {
      throw new CustomError({
        message: 'Cannot delete category that is linked to active listings.',
        code: 'CATEGORY_IN_USE',
      });
    }

    await deleteCategory(supabase, id);
    revalidatePath('/dashboard/management');
  }
);

// ─── Location Actions ─────────────────────────────────────────────────────────

export const getLocationsAction = errorHandler(
  async (): Promise<Location[]> => {
    await requireRole(['admin', 'moderator']);
    const supabase = await createClient();
    return getLocationsQuery(supabase);
  }
);

export const createLocationAction = errorHandler(
  async (input: CreateLocationInput): Promise<Location> => {
    await requireRole(['admin']);
    const validated = CreateLocationSchema.parse(input);
    const supabase = await createClient();
    const result = await createLocation(supabase, validated);
    revalidatePath('/dashboard/management');
    return result;
  }
);

export const updateLocationAction = errorHandler(
  async (id: string, input: UpdateLocationInput): Promise<Location> => {
    await requireRole(['admin']);
    const validated = UpdateLocationSchema.parse(input);
    const supabase = await createClient();
    const result = await updateLocation(supabase, id, validated);
    revalidatePath('/dashboard/management');
    return result;
  }
);

export const deleteLocationAction = errorHandler(
  async (id: string): Promise<void> => {
    await requireRole(['admin']);
    const supabase = await createClient();

    const inUse = await checkLocationInUse(supabase, id);
    if (inUse) {
      throw new CustomError({
        message: 'Cannot delete location that is linked to active listings.',
        code: 'LOCATION_IN_USE',
      });
    }

    await deleteLocation(supabase, id);
    revalidatePath('/dashboard/management');
  }
);
