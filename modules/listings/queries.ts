import 'server-only';

import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';
import { CAROUSEL_CARD_NUM } from '@/constant';
import { authHandler } from '@/utils/auth-handler';
import { GroupedCategory, ImageUploadResult } from './types';
import { zodValidation } from '@/lib/zod-error';
import z from 'zod';
import { createListingServerSchema, updateListingServerSchema } from './schema';
import { DEFAULT_LIMIT_NUMBER, DEFAULT_PAGE_NUMBER } from '@/constants/pagination';

// Type definitions for return types
type ListingRow = Database['public']['Tables']['marketplace_listings']['Row'];
type CategoryRow =
  Database['public']['Tables']['marketplace_categories']['Row'];
type LocationRow = Database['public']['Tables']['locations']['Row'];


type ListingImageRow = Database['public']['Tables']['listing_images']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];

export type ListingCardItem = SimilarListingRes & {
  created_at: string;
  image: string;
  location: string;
  sellerName: string;
  isVerified: boolean;
};

export type PriceRange = {
  min: number;
  max: number | null;
};

export type ListingsFilter = {
  categories: string[];
  locations: string[];
  conditions: string[];
  priceRanges: PriceRange[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type GetListingDetailsRes = ListingRow & {
  marketplace_categories: CategoryRow;
  locations: LocationRow;
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

export type SellerListingRes = SimilarListingRes & {
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

  return data as unknown as GetListingDetailsRes;
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
 * Get all active categories grouped by parent
 * Uses the database function get_grouped_categories()
 * Returns parent categories with their subcategories nested
 */
export async function getGroupedCategoriesQuery(): Promise<GroupedCategory[]> {
  'use server';
  const client = await createClient();

  const { data, error } = await client.rpc('get_grouped_categories');

  if (error) {
    console.error('Error fetching grouped categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all active categories without parent
 */
export async function getCategoriesWithoutParentQuery(): Promise<CategoryRow[]> {
  'use server';
  const client = await createClient();

  const { data, error } = await client
    .from('marketplace_categories')
    .select('*')
    .eq('is_active', true)
    .not('parent_id', 'is', null)

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
 * Insert listing images into the database
 * @param listingId - The listing ID to associate images with
 * @param images - Array of image data to insert
 */
async function insertListingImagesQuery(
  client: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  images: ImageUploadResult[]
): Promise<void> {
  if (images.length === 0) return;

  const imageRecords = images.map((img, index) => ({
    listing_id: listingId,
    image_url: img.url,
    is_thumbnail: img.isThumbnail || index === 0,
    sort_order: index,
  }));

  const { error } = await client.from('listing_images').insert(imageRecords);

  if (error) {
    console.error('Error inserting listing images:', error);
    throw new Error('Failed to save listing images');
  }
}

/**
 * Create a new listing with images
 * Inserts a new listing and its images into the database
 */
export async function createListingQuery(
  listingData: Omit<z.infer<typeof createListingServerSchema>, 'seller_id'>
): Promise<{ listingId: string }> {
  'use server';
  const client = await createClient();
  const user = await authHandler();

  const validatedListingData = zodValidation(createListingServerSchema, {
    ...listingData,
    seller_id: user.id,
  });
  const { images, ...newListingData } = validatedListingData;
  // Insert listing
  const { data, error } = await client
    .from('marketplace_listings')
    .insert({
      ...newListingData,
      seller_id: user.id,
      content_status: 'published',
    })
    .select('listing_id')
    .single();

  if (error) {
    console.error('Error creating listing:', error);
    throw new Error('Failed to create listing');
  }

  // Insert images if provided
  if (images.length > 0) {
    try {
      await insertListingImagesQuery(client, data.listing_id, images);
    } catch (imageError) {
      // Rollback: delete the created listing if image insert fails
      await client
        .from('marketplace_listings')
        .delete()
        .eq('listing_id', data.listing_id);
      throw imageError;
    }
  }

  return { listingId: data.listing_id };
}

/**
 * Update an existing listing with validation
 * Updates listing data in the database with Zod schema validation
 */
export async function updateListingQuery(
  listingId: string,
  listingData: z.infer<typeof updateListingServerSchema>
): Promise<void> {
  'use server';
  const client = await createClient();
  const user = await authHandler();

  // Validate listing data
  const validatedData = zodValidation(updateListingServerSchema, listingData);
  const { images, ...updateData } = validatedData;

  // Update listing - ensure user is the seller
  const { error } = await client
    .from('marketplace_listings')
    .update(updateData)
    .eq('listing_id', listingId)
    .eq('seller_id', user.id);

  if (error) {
    console.error('Error updating listing:', error);
    throw new Error('Failed to update listing');
  }

  // Handle images update
  if (images && images.length > 0) {
    // Delete existing images
    const { error: deleteError } = await client
      .from('listing_images')
      .delete()
      .eq('listing_id', listingId);

    if (deleteError) {
      console.error('Error deleting existing images:', deleteError);
      throw new Error('Failed to update listing images');
    }

    // Insert new/updated images
    const imageRecords = images.map((img, index) => ({
      listing_id: listingId,
      image_url: img.url,
      is_thumbnail: img.isThumbnail || index === 0,
      sort_order: index,
    }));

    const { error: insertError } = await client
      .from('listing_images')
      .insert(imageRecords);

    if (insertError) {
      console.error('Error inserting updated images:', insertError);
      throw new Error('Failed to save listing images');
    }
  }
}

/**
 * Get listings with filters
 * Supports filtering by category, location, condition, price, and sorting
 */
export async function getListingsQuery(
  {
    filters,
    page = DEFAULT_PAGE_NUMBER,
    limit = DEFAULT_LIMIT_NUMBER,
  }: {
    filters: Partial<ListingsFilter>;
    page?: number;
    limit?: number;
  }
): Promise<{ data: ListingCardItem[]; count: number }> {
  'use server';
  const client = await createClient();

  let query = client.from('marketplace_listings').select(
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
      ),
      users!marketplace_listings_seller_id_fkey (
        first_name,
        last_name,
        is_verified
      )
    `,
    { count: 'exact' }
  );

  // Apply filters
  query = query.eq('content_status', 'published');

  if (filters.categories && filters.categories.length > 0) {
    query = query.in('category_id', filters.categories);
  }

  if (filters.locations && filters.locations.length > 0) {
    query = query.in('location_id', filters.locations);
  }

  if (filters.conditions && filters.conditions.length > 0) {
    query = query.in('product_condition', filters.conditions);
  }

  if (filters.priceRanges && filters.priceRanges.length > 0) {
    // Construct OR query for price ranges
    const priceConditions = filters.priceRanges
      .map((range) => {
        const conditions = [];
        if (range.min !== undefined && range.min !== null) {
          conditions.push(`price.gte.${range.min}`);
        }
        if (range.max !== undefined && range.max !== null) {
          conditions.push(`price.lte.${range.max}`);
        }
        return conditions.length > 0 ? `and(${conditions.join(',')})` : null;
      })
      .filter(Boolean)
      .join(',');

    if (priceConditions) {
      query = query.or(priceConditions);
    }
  }

  // Sorting
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder === 'asc';

  if (sortBy === 'price') {
    query = query.order('price', { ascending: sortOrder });
  } else {
    query = query.order('created_at', { ascending: sortOrder });
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching listings:', error);
    return { data: [], count: 0 };
  }

  const mappedData: ListingCardItem[] = (data || []).map((item) => {
    // Cast item to a type that includes the joined fields
    const rawItem = item as SellerListingRes & {
      users: UserRow | UserRow[] | null;
      locations: LocationRow | LocationRow[] | null;
      listing_images: ListingImageRow[];
    };

    // Find thumbnail or first image
    const images = rawItem.listing_images || [];
    const thumbnailObj =
      images.find((img) => img.is_thumbnail) || images[0];
    const image = thumbnailObj ? thumbnailObj.image_url : '';

    // Location name
    // Assuming locations is an object (many-to-one) but Supabase might return array if not strictly single
    // From similar listings types, it was modeled as array, but based on schema it should be one.
    // We'll safely check if it's array or object.
    const loc = Array.isArray(rawItem.locations)
      ? rawItem.locations[0]
      : rawItem.locations;
    const location = loc ? loc.name : '';

    // Seller info
    const user = Array.isArray(rawItem.users) ? rawItem.users[0] : rawItem.users;
    const sellerName = user
      ? `${user.first_name} ${user.last_name}`.trim()
      : 'Unknown Seller';
    const isVerified = user ? !!user.is_verified : false;

    return {
      ...item,
      image,
      location,
      sellerName,
      isVerified,
    };
  });

  return { data: mappedData, count: count || 0 };
}
