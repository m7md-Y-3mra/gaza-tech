export type ListingFormMode = 'create' | 'update';

type ListingFormClient = {
    categories: Array<{ value: string; label: string }>;
    locations: Array<{ value: string; label: string }>;
}

type ListingFormClientCreate = ListingFormClient & {
    mode: 'create';
}

type ListingFormClientUpdate = ListingFormClient & {
    mode: 'update';
    listingId: string;
}

export type ListingFormClientProps = ListingFormClientCreate | ListingFormClientUpdate;
