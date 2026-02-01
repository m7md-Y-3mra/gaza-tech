import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Reusable Field Groups
export const LISTING_FIELDS = {
  MINIMAL: `
    listing_id,
    title,
    price,
    currency,
    product_condition,
    content_status
  `,
  DETAILS: `
    description,
    created_at,
    specifications,
    seller_id,
    category_id,
    location_id
  `,
};

// Reusable Relations
export const LISTING_RELATIONS = {
  IMAGES_ALL: `
    listing_images (
      listing_image_id,
      image_url,
      is_thumbnail,
      sort_order
    )
  `,
  IMAGES_THUMBNAIL: `
    listing_images (
      image_url,
      is_thumbnail
    )
  `,
  LOCATION: `
    locations (
      location_id,
      name,
      name_ar
    )
  `,
  CATEGORY: `
    marketplace_categories (
      marketplace_category_id,
      name,
      slug
    )
  `,
};

// Base Query
export function createBaseQuery(client: SupabaseClient<Database>) {
  return client.from('marketplace_listings');
}

// Composable Filters
export function filterPublished(query: any) {
  return query.eq('content_status', 'published');
}

export function excludeListing(query: any, listingId: string) {
  return query.neq('listing_id', listingId);
}

export function filterByCategory(query: any, categoryId: string) {
  return query.eq('category_id', categoryId);
}

export function filterBySeller(query: any, sellerId: string) {
  return query.eq('seller_id', sellerId);
}

// Bookmark Repository Functions
export function createBookmarkQuery(client: SupabaseClient<Database>) {
  return client.from('bookmarked_listings');
}

export function filterByUser(query: any, userId: string) {
  return query.eq('user_id', userId);
}

export function filterByListing(query: any, listingId: string) {
  return query.eq('listing_id', listingId);
}
