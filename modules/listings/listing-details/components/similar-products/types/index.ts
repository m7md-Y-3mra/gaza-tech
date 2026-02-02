import { Database } from '@/types/supabase';

export type SimilarProductsProps = {
  categoryId: string;
  currentListingId: string;
};

export type ProductCardData = Pick<
  Database['public']['Tables']['marketplace_listings']['Row'],
  'title' | 'price' | 'currency'
> & {
  id: string;
  imageUrl: string;
  locationName: string;
  productCondition: string;
};
