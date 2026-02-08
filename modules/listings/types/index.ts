import { Database } from "@/types/supabase";

export const ProductCondition = {
    new: 'New',
    used: "Used",
    broken: "Broken",
    refurbished: "Refurbished",
} as const;

export type ProductConditionType =
    (typeof ProductCondition)[keyof typeof ProductCondition];

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

export type InsertListings = Database['public']['Tables']['marketplace_listings']['Insert'];

export type InsertListingsWithoutSellerId = Omit<Database['public']['Tables']['marketplace_listings']['Insert'], 'seller_id'>;

export type ImageFile = { file: File, isThumbnail: boolean };

// Type for uploaded image result from client-side upload
export type ImageUploadResult = {
    path: string;      // Storage path for cleanup
    url: string;       // Public URL for display
    isThumbnail: boolean;
};

// Type for grouped categories (matches database function return type)
export type GroupedCategory = {
    parentId: string;
    parentLabel: string;
    children: Array<{ value: string; label: string }>;
};
