import 'server-only';

import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';
import { CAROUSEL_CARD_NUM } from '@/constant';
import { authHandler } from '@/utils/auth-handler';
import { InsertListingsWithoutSellerId } from './types';

// Type definitions for return types
type ListingRow = Database['public']['Tables']['marketplace_listings']['Row'];
type CategoryRow =
  Database['public']['Tables']['marketplace_categories']['Row'];
type LocationRow = Database['public']['Tables']['locations']['Row'];
type ListingImageRow = Database['public']['Tables']['listing_images']['Row'];

type GetListingDetailsRes = ListingRow & {
  marketplace_categories: CategoryRow[];
  locations: LocationRow[];
  listing_images: ListingImageRow[];
};

type SimilarListingRes = Pick<
  ListingRow,
  | 'listing_id'
  | 'title'
  | 'price'
  | 'currency'
  | 'product_condition'
  | 'content_status'
> & {
  listing_images: Pick<ListingImageRow, 'image_url' | 'is_thumbnail'>[];
  locations: Pick<LocationRow, 'location_id' | 'name' | 'name_ar'>[];
};

type SellerListingRes = SimilarListingRes & {
  created_at: string;
};

/**
 * Get listing details
 * Fetches complete listing information including category, location, and images
 */
export async function getListingDetailsQuery(
  listingId: string
): Promise<GetListingDetailsRes | null> {
  'use server';
  const client = await createClient();

  const { data, error } = await client
    .from('marketplace_listings')
    .select(
      `
      listing_id,
      title,
      price,
      currency,
      product_condition,
      content_status,
      description,
      created_at,
      specifications,
      seller_id,
      category_id,
      location_id,
      marketplace_categories (
        marketplace_category_id,
        name,
        slug
      ),
      locations (
        location_id,
        name,
        name_ar
      ),
      listing_images (
        listing_image_id,
        image_url,
        is_thumbnail,
        sort_order
      )
    `
    )
    .eq('content_status', 'published')
    .eq('listing_id', listingId)
    .order('sort_order', { foreignTable: 'listing_images', ascending: true })
    .single();

  if (error) {
    console.error('Error fetching listing details:', error);
    return null;
  }

  return data as GetListingDetailsRes;
}

/**
 * Get similar listings by category
 * Fetches listings from the same category, excluding the current listing
 */
export async function getSimilarListingsQuery(
  categoryId: string,
  currentListingId: string,
  limit: number = CAROUSEL_CARD_NUM
): Promise<SimilarListingRes[]> {
  'use server';
  const client = await createClient();

  const { data, error } = await client
    .from('marketplace_listings')
    .select(
      `
      listing_id,
      title,
      price,
      currency,
      product_condition,
      content_status,
      listing_images (
        image_url,
        is_thumbnail
      ),
      locations (
        location_id,
        name,
        name_ar
      )
    `
    )
    .eq('content_status', 'published')
    .eq('category_id', categoryId)
    .neq('listing_id', currentListingId)
    .limit(limit);

  if (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }

  return (data || []) as SimilarListingRes[];
}

/**
 * Get aggregated listings for a seller
 * Fetches listings by seller_id, excluding current listing
 */
export async function getSellerListingsQuery(
  sellerId: string,
  currentListingId: string,
  limit: number = CAROUSEL_CARD_NUM
): Promise<SellerListingRes[]> {
  'use server';
  const client = await createClient();

  const { data, error } = await client
    .from('marketplace_listings')
    .select(
      `
      listing_id,
      title,
      price,
      currency,
      product_condition,
      content_status,
      created_at,
      listing_images (
        image_url,
        is_thumbnail
      ),
      locations (
        location_id,
        name,
        name_ar
      )
    `
    )
    .eq('content_status', 'published')
    .eq('seller_id', sellerId)
    .neq('listing_id', currentListingId)
    .limit(limit);

  if (error) {
    console.error('Error fetching seller listings:', error);
    return [];
  }

  return (data || []) as SellerListingRes[];
}

/**
 * Check if a listing is bookmarked by the current user
 */
export async function checkIsBookmarkedQuery(
  listingId: string
): Promise<boolean> {
  'use server';
  const user = await authHandler();
  const client = await createClient();

  const { data, error } = await client
    .from('bookmarked_listings')
    .select('listing_id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single();

  if (error) {
    // If error is "not found", it means not bookmarked
    if (error.code === 'PGRST116') {
      return false;
    }
    throw error;
  }

  return !!data;
}

/**
 * Toggle bookmark status for a listing
 */
export async function toggleBookmarkQuery(
  listingId: string
): Promise<{ isBookmarked: boolean }> {
  'use server';
  const user = await authHandler();
  const client = await createClient();

  // Check if already bookmarked
  const { data: existingBookmark, error: checkError } = await client
    .from('bookmarked_listings')
    .select('listing_id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single();

  // If error is "not found", it means not bookmarked, otherwise throw
  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError;
  }

  if (existingBookmark) {
    // Remove bookmark
    const { error: deleteError } = await client
      .from('bookmarked_listings')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (deleteError) {
      throw deleteError;
    }

    return { isBookmarked: false };
  } else {
    // Add bookmark
    const { error: insertError } = await client
      .from('bookmarked_listings')
      .insert({
        user_id: user.id,
        listing_id: listingId,
      });

    if (insertError) {
      throw insertError;
    }

    return { isBookmarked: true };
  }
}

/**
 * Get all active categories
 * Used for category selection in create/update listing forms
 * Returns only top-level parent categories (parent_id IS NULL)
 * For subcategories, use getSubcategoriesQuery with parent_id
 */
export async function getCategoriesQuery(): Promise<CategoryRow[]> {
  'use server';
  const client = await createClient();

  const { data, error } = await client
    .from('marketplace_categories')
    .select('*')
    .eq('is_active', true)
    .is('parent_id', null) // Only top-level parent categories
    // .not('parent_id', 'is', null) // Only categories that HAVE a parent
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all active locations
 * Used for location selection in create/update listing forms
 */
export async function getLocationsQuery(): Promise<LocationRow[]> {
  'use server';
  const client = await createClient();

  const { data, error } = await client
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new listing
 * Inserts a new listing into the database
 */
export async function createListingQuery(
  listingData: InsertListingsWithoutSellerId
): Promise<{ listingId: string }> {
  'use server';
  const client = await createClient();

  const { data, error } = await client
    .from('marketplace_listings')
    .insert(listingData)
    .select('listing_id')
    .single();

  if (error) {
    console.error('Error creating listing:', error);
    throw new Error('Failed to create listing');
  }

  return { listingId: data.listing_id };
}

/**
 * Update an existing listing
 * Updates listing data in the database
 */
export async function updateListingQuery(
  listingId: string,
  listingData: Database['public']['Tables']['marketplace_listings']['Update']
): Promise<void> {
  'use server';
  const client = await createClient();

  const { error } = await client
    .from('marketplace_listings')
    .update(listingData)
    .eq('listing_id', listingId);

  if (error) {
    console.error('Error updating listing:', error);
    throw new Error('Failed to update listing');
  }
}
