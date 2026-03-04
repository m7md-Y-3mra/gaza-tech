import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';
import {
  DEFAULT_LIMIT_NUMBER,
  DEFAULT_PAGE_NUMBER,
} from '@/constants/pagination';
import { authHandler } from '@/utils/auth-handler';
import type { ProfileListingItem, BookmarkedListingItem } from './types';

type User = Database['public']['Tables']['users']['Row'];

/**
 * Get user by ID
 * Single purpose: Fetch user details from users table
 */
export async function getUserById(userId: string) {
  const client = await createClient();

  const { data, error } = await client
    .from('users')
    .select(
      `
      user_id,
      first_name,
      last_name,
      avatar_url,
      bio,
      is_verified,
      is_active,
      created_at,
      updated_at,
      phone_number,
      whatsapp_number,
      facebook_link_url,
      instagram_link_url,
      twitter_link_url,
      website_url,
      user_role,
      last_activity_at
    `
    )
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as User;
}

/**
 * Get count of user's active listings
 * Single purpose: Count published listings for a user
 */
export async function getUserListingsCount(userId: string): Promise<number> {
  const client = await createClient();

  const { count, error } = await client
    .from('marketplace_listings')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('content_status', 'published');

  if (error) {
    console.error('Error counting user listings:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get user information with listings count
 * Combines getUserById and getUserListingsCount
 */
export async function getUserAndListingsCount(userId: string) {
  const [user, listingsCount] = await Promise.all([
    getUserById(userId),
    getUserListingsCount(userId),
  ]);

  if (!user) {
    return null;
  }

  return {
    ...user,
    listingsCount,
  };
}

// ─── Profile Page Queries ──────────────────────────────────────────────────────

type GetUserListingsParams = {
  userId: string;
  page?: number;
  limit?: number;
};

type GetUserListingsResult = {
  data: ProfileListingItem[];
  count: number;
};

/**
 * Get paginated listings for a user's profile page
 * Returns listings with thumbnail image, price, currency, and created_at
 */
export async function getUserListingsQuery({
  userId,
  page = DEFAULT_PAGE_NUMBER,
  limit = DEFAULT_LIMIT_NUMBER,
}: GetUserListingsParams): Promise<GetUserListingsResult> {
  const client = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await client
    .from('marketplace_listings')
    .select(
      `
      listing_id,
      title,
      price,
      currency,
      product_condition,
      created_at,
      description,
      listing_images (
        image_url,
        is_thumbnail
      )
    `,
      { count: 'exact' }
    )
    .eq('seller_id', userId)
    .eq('content_status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching user listings:', error);
    throw new Error('Failed to fetch user listings');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings: ProfileListingItem[] = (data || []).map((item: any) => {
    const thumbnailImage = item.listing_images?.find(
      (img: { image_url: string; is_thumbnail: boolean | null }) =>
        img.is_thumbnail
    );
    const image =
      thumbnailImage?.image_url || item.listing_images?.[0]?.image_url || '';

    return {
      listing_id: item.listing_id,
      title: item.title,
      price: item.price,
      currency: item.currency,
      product_condition: item.product_condition,
      created_at: item.created_at,
      description: item.description || '',
      image,
    };
  });

  return { data: listings, count: count || 0 };
}

type GetBookmarkedListingsParams = {
  page?: number;
  limit?: number;
};

type GetBookmarkedListingsResult = {
  data: BookmarkedListingItem[];
  count: number;
};

/**
 * Get paginated bookmarked listings for the current authenticated user
 */
export async function getBookmarkedListingsQuery({
  page = DEFAULT_PAGE_NUMBER,
  limit = DEFAULT_LIMIT_NUMBER,
}: GetBookmarkedListingsParams): Promise<GetBookmarkedListingsResult> {
  const user = await authHandler();
  const client = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await client
    .from('bookmarked_listings')
    .select(
      `
      created_at,
      marketplace_listings (
        listing_id,
        title,
        price,
        currency,
        product_condition,
        created_at,
        description,
        listing_images (
          image_url,
          is_thumbnail
        )
      )
    `,
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching bookmarked listings:', error);
    throw new Error('Failed to fetch bookmarked listings');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings: BookmarkedListingItem[] = (data || []).map((item: any) => {
    const listing = item.marketplace_listings;
    const thumbnailImage = listing?.listing_images?.find(
      (img: { image_url: string; is_thumbnail: boolean | null }) =>
        img.is_thumbnail
    );
    const image =
      thumbnailImage?.image_url ||
      listing?.listing_images?.[0]?.image_url ||
      '';

    return {
      listing_id: listing?.listing_id || '',
      title: listing?.title || '',
      price: listing?.price || 0,
      currency: listing?.currency || null,
      product_condition: listing?.product_condition || '',
      created_at: listing?.created_at || null,
      description: listing?.description || '',
      image,
      bookmarked_at: item.created_at,
    };
  });

  return { data: listings, count: count || 0 };
}

export const getCurrentUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};
