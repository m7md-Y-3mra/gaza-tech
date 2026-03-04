import type { ProfileListingItem } from '@/modules/user/types';

export type ProfileListingCardProps = {
    listing: ProfileListingItem;
    isOwner: boolean;
};
