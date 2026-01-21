import type { Database } from '@/types/supabase';

// Re-export Supabase types
export type Listing = Database['public']['Tables']['marketplace_listings']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Location = Database['public']['Tables']['locations']['Row'];
export type ListingImage = Database['public']['Tables']['listing_images']['Row'];

// Extended types for the page
export interface ListingWithDetails extends Listing {
    location: Location | null;
    images: ListingImage[];
}

export interface ListingDetailsPageProps {
    id: string;
}
