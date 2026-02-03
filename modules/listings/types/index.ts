export const ProductCondition = {
    NEW: 'new',
    LIKE_NEW: 'like-new',
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    PARTS: 'parts',
} as const;

export type ProductConditionType =
    (typeof ProductCondition)[keyof typeof ProductCondition];

export const Currency = {
    ILS: 'ILS',
    USD: 'USD',
} as const;

export type CurrencyType = (typeof Currency)[keyof typeof Currency];

export const specifications = {
    brand: 'brand',
    model: 'model',
    processor: 'processor',
    ram: 'ram',
    storage: 'storage',
    graphics_card: 'graphics_card',
    display: 'display',
    operating_system: 'operating_system',
    warranty: 'warranty',
    battery: 'battery',
} as const;
