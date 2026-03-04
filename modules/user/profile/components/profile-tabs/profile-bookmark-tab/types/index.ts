import type { BookmarkedListingItem } from '@/modules/user/types';

export type ProfileBookmarkTabProps = {
    page: number;
};

export type ProfileBookmarkTabClientProps = {
    bookmarkedListings: BookmarkedListingItem[];
    bookmarkedCount: number;
    pageSize: number;
};
