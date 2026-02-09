import { GroupedCategory } from "@/modules/listings/types";

export type ListingFormMode = 'create' | 'update';

// Initial data structure for update mode
export type ListingFormInitialData = {
    title: string;
    description: string;
    price: number;
    currency: string;
    category_id: string;
    product_condition: string;
    location_id: string;
    specifications: Array<{
        label: string;
        value: string;
        isCustom: boolean;
    }>;
    images: Array<{
        id: string;
        preview: string;
        isThumbnail: boolean;
        isExisting: true;
    }>;
};

type ListingFormClient = {
    groupedCategories: GroupedCategory[];
    locations: Array<{ value: string; label: string }>;
}

type ListingFormClientCreate = ListingFormClient & {
    mode: 'create';
}

type ListingFormClientUpdate = ListingFormClient & {
    mode: 'update';
    listingId: string;
    initialData: ListingFormInitialData;
}

export type ListingFormClientProps = ListingFormClientCreate | ListingFormClientUpdate;

