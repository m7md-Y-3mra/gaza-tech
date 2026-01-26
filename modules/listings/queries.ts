import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';
import { CAROUSEL_CARD_NUM } from '@/constant';
import {
  createBaseQuery,
  filterPublished,
  filterByCategory,
  excludeListing,
  LISTING_FIELDS,
  LISTING_RELATIONS,
} from './repository';

// complete the type of getListingDetails (auto-complete this) in listing type - I wait it
type GetListingDetailsRes = Database['public']['Tables']['marketplace_listings']['Row'] & {
  marketplace_categories: Database['public']['Tables']['marketplace_categories']['Row'][];
  locations: Database['public']['Tables']['locations']['Row'][];
  listing_images: Database['public']['Tables']['listing_images']['Row'][];
};

export async function getListingDetails(listingId: string): Promise<GetListingDetailsRes | null> {
  const client = await createClient();

  const query = filterPublished(createBaseQuery(client))
    .select(`
      ${LISTING_FIELDS.MINIMAL},
      ${LISTING_FIELDS.DETAILS},
      ${LISTING_RELATIONS.CATEGORY},
      ${LISTING_RELATIONS.LOCATION},
      ${LISTING_RELATIONS.IMAGES_ALL}
    `)
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
export async function getSimilarListings(
  categoryId: string,
  currentListingId: string,
  limit: number = CAROUSEL_CARD_NUM
) {
  const client = await createClient();

  const query = filterPublished(
    excludeListing(filterByCategory(createBaseQuery(client), categoryId), currentListingId)
  )
    .select(`
      ${LISTING_FIELDS.MINIMAL},
      ${LISTING_RELATIONS.IMAGES_THUMBNAIL},
      ${LISTING_RELATIONS.LOCATION}
    `)
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }

  return data || [];
}
