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
