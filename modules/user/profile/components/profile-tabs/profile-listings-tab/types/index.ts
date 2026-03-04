import type { ProfileListingItem } from '@/modules/user/types';

export type ProfileListingsTabProps = {
    userId: string;
    page: number;
    isOwner: boolean;
};

export type ProfileListingsTabClientProps = {
    listings: ProfileListingItem[];
    listingsCount: number;
    isOwner: boolean;
    pageSize: number;
};
