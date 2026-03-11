import { Database } from '@/types/supabase';

export const ProductCondition = {
  brand_new: 'Brand New',
  used_good: 'Used Good',
  for_parts: 'For Parts',
  used_excellent: 'Used Excellent',
} as const;

export type ProductConditionType = keyof typeof ProductCondition;

export const Currency = {
  ILS: 'ILS',
  USD: 'USD',
} as const;

export type CurrencyType = (typeof Currency)[keyof typeof Currency];

export const specifications = {
  brand: 'Brand',
  model: 'Model',
  processor: 'Processor',
  ram: 'RAM',
  storage: 'Storage',
  graphics_card: 'Graphics Card',
  display: 'Display',
  operating_system: 'Operating System',
  warranty: 'Warranty',
  battery: 'Battery',
} as const;

export type SpecificationEnum =
  (typeof specifications)[keyof typeof specifications];

export type InsertListings =
  Database['public']['Tables']['marketplace_listings']['Insert'];

export type InsertListingsWithoutSellerId = Omit<
  Database['public']['Tables']['marketplace_listings']['Insert'],
  'seller_id'
>;

// Type for uploaded image result from client-side upload
export type ImageUploadResult = {
  path: string; // Storage path for cleanup
  url: string; // Public URL for display
  isThumbnail: boolean;
};

// Type for grouped categories (matches database function return type)
export type GroupedCategory = {
  parentId: string;
  parentLabel: string;
  parentLabelAr: string;
  children: Array<{ value: string; label: string; labelAr: string }>;
};

export type PredefinedSpecificationType = {
  label: SpecificationEnum;
  value: string;
  isCustom: false;
};

export type CustomSpecificationType = {
  label: string;
  value: string;
  isCustom: true;
};

export type Specification =
  | PredefinedSpecificationType
  | CustomSpecificationType;

export type Listing =
  Database['public']['Tables']['marketplace_listings']['Row'];

