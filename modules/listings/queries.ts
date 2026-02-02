import 'server-only'

import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';
import { CAROUSEL_CARD_NUM } from '@/constant';
import {
  createBaseQuery,
  filterPublished,
  filterByCategory,
  filterBySeller,
  excludeListing,
  LISTING_FIELDS,
  LISTING_RELATIONS,
  createBookmarkQuery,
  filterByUser,
  filterByListing,
} from './repository';
import { authHandler } from '@/utils/auth-handler';
import { PostgrestError } from '@supabase/supabase-js';

// complete the type of getListingDetails (auto-complete this) in listing type - I wait it
type GetListingDetailsRes = Database['public']['Tables']['marketplace_listings']['Row'] & {
  marketplace_categories: Database['public']['Tables']['marketplace_categories']['Row'][];
  locations: Database['public']['Tables']['locations']['Row'][];
  listing_images: Database['public']['Tables']['listing_images']['Row'][];
};

export async function getListingDetailsQuery(listingId: string): Promise<GetListingDetailsRes | null> {
  'use server'
  const client = await createClient();

  const baseQuery = createBaseQuery(client).select(`
      ${LISTING_FIELDS.MINIMAL},
      ${LISTING_FIELDS.DETAILS},
      ${LISTING_RELATIONS.CATEGORY},
      ${LISTING_RELATIONS.LOCATION},
      ${LISTING_RELATIONS.IMAGES_ALL}
    `);

  const query = filterPublished(baseQuery)
    .eq('listing_id', listingId)
    .order('sort_order', { foreignTable: 'listing_images', ascending: true })
    .single();

  const { data, error } = await query;

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
) {
  'use server'
  const client = await createClient();

  const baseQuery = createBaseQuery(client).select(`
      ${LISTING_FIELDS.MINIMAL},
      ${LISTING_RELATIONS.IMAGES_THUMBNAIL},
      ${LISTING_RELATIONS.LOCATION}
    `);

  const query = filterPublished(
    excludeListing(filterByCategory(baseQuery, categoryId), currentListingId)
  ).limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }

  return data || [];
}

/**
 * Get aggregated listings for a seller
 * Fetches listings by seller_id, excluding current listing
 */
export async function getSellerListingsQuery(

  sellerId: string,
  currentListingId: string,
  limit: number = CAROUSEL_CARD_NUM
) {
  'use server'
  const client = await createClient();

  // Select fields FIRST, then apply filters
  const baseQuery = createBaseQuery(client).select(`
      ${LISTING_FIELDS.MINIMAL},
      ${LISTING_RELATIONS.IMAGES_THUMBNAIL},
      ${LISTING_RELATIONS.LOCATION},
      created_at
    `);

  const query = filterPublished(
    excludeListing(filterBySeller(baseQuery, sellerId), currentListingId)
  ).limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching seller listings:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if a listing is bookmarked by the current user
 */
export async function checkIsBookmarkedQuery(listingId: string) {
  'use server'
  const user = await authHandler();

  const client = await createClient();

  const baseQuery = createBookmarkQuery(client).select('listing_id');

  const query = filterByListing(filterByUser(baseQuery, user.id), listingId).single();

  const { data, error } = await query;

  if (error) {
    throw error as PostgrestError;
  }

  return !!data;
}

/**
 * Toggle bookmark status for a listing
 */
export async function toggleBookmarkQuery(listingId: string) {
  'use server'
  const user = await authHandler();
  const client = await createClient();

  // Check if already bookmarked
  const checkQuery = filterByListing(
    filterByUser(createBookmarkQuery(client).select('listing_id'), user.id),
    listingId
  ).single();

  const { data: existingBookmark, error: checkError } = await checkQuery;

  if (checkError) {
    throw checkError;
  }

  if (existingBookmark) {
    // Remove bookmark
    const { error: deleteError } = await createBookmarkQuery(client)
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (deleteError) {
      throw deleteError;
    }

    return { isBookmarked: false };
  } else {
    // Add bookmark
    const { error: insertError } = await createBookmarkQuery(client).insert({
      user_id: user.id,
      listing_id: listingId,
    });

    if (insertError) {
      throw insertError;
    }

    return { isBookmarked: true };
  }
}
