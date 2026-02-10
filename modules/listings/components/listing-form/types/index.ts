import { GroupedCategory } from "@/modules/listings/types";
import { Specification } from "@/types/supabase";
import { ImageFileUploadImage } from "../components/image-upload/types";

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
    specifications: Array<Specification>;
    images: Array<ImageFileUploadImage>
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

export type ImageFileBase = {
    isThumbnail: boolean;
};

export type CreateImageFile = ImageFileBase & {
    isExisting?: false,
    file: File;
}

export type UpdateImageFile = ImageFileBase & {
    preview: string;
    isExisting: true,
}

export type ImageFile = CreateImageFile | UpdateImageFile;

