import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';

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
