import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';

// complete the type of getListingDetails (auto-complete this) in listing type - I wait it
type GetListingDetailsRes = Database['public']['Tables']['marketplace_listings']['Row'] & {
  marketplace_categories: Database['public']['Tables']['marketplace_categories']['Row'][];
  locations: Database['public']['Tables']['locations']['Row'][];
  listing_images: Database['public']['Tables']['listing_images']['Row'][];
};

export async function getListingDetails(listingId: string): Promise<GetListingDetailsRes | null> {
  const client = await createClient();
  const { data, error } = await client
    .from('marketplace_listings')
    .select(
      `
      listing_id,
      title,
      description,
      price,
      currency,
      product_condition,
      created_at,
      content_status,
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
    .eq('listing_id', listingId)
    .eq('content_status', 'published')
    .order('sort_order', { foreignTable: 'listing_images', ascending: true })
    .single();

  if (error) {
    console.error('Error fetching listing details:', error);
    return null;
  }

  return data as GetListingDetailsRes;
}
