export type ListingFormMode = 'create' | 'update';

type ListingForm = {
    onSuccess?: (listingId: string) => void;
    onCancel?: () => void;
    categories: Array<{ value: string; label: string }>;
    locations: Array<{ value: string; label: string }>;
}

type ListingFormCreate = ListingForm & {
    mode: 'create';
}

type ListingFormUpdate = ListingForm & {
    mode: 'update';
    listingId: string;
}

export type ListingFormProps = ListingFormCreate | ListingFormUpdate;
