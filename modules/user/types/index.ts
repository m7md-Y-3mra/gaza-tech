import type { Database } from '@/types/supabase';

// Re-export Supabase types
export type ProfileUser = Database['public']['Tables']['users']['Row'];

// Listing card item for profile page
export type ProfileListingItem = {
    listing_id: string;
    title: string;
    price: number;
    currency: string | null;
    product_condition: string;
    created_at: string | null;
    image: string;
    description: string;
};

// Bookmarked listing item
export type BookmarkedListingItem = ProfileListingItem & {
    bookmarked_at: string | null;
};
