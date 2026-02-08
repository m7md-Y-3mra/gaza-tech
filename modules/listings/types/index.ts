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

export type InsertListingsWithoutSellerId = Omit<Database['public']['Tables']['marketplace_listings']['Insert'], 'seller_id'>;

// Type for uploaded image result from client-side upload
export type ImageUploadResult = {
    path: string;      // Storage path for cleanup
    url: string;       // Public URL for display
    isThumbnail: boolean;
};
