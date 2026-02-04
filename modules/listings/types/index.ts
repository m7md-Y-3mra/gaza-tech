export const ProductCondition = {
    NEW: 'New',
    LIKE_NEW: 'Like New',
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    FAIR: 'Fair',
    PARTS: 'For Parts',
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
