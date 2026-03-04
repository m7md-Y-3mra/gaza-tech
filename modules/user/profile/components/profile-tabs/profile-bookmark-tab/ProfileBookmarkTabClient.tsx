'use client';

import ProfileListingCard from '../../profile-listing-card';
import ProfilePagination from '../../profile-pagination';
import { Bookmark } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ProfileBookmarkTabClientProps } from './types';

const ProfileBookmarkTabClient = ({
  bookmarkedListings,
  bookmarkedCount,
  pageSize,
}: ProfileBookmarkTabClientProps) => {
  const t = useTranslations('Profile.BookmarkTab');

  if (bookmarkedListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Bookmark className="text-muted-foreground mb-4 size-12" />
        <p className="text-muted-foreground">{t('noBookmarks')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {bookmarkedListings.map((listing) => (
          <ProfileListingCard
            key={listing.listing_id}
            listing={listing}
            isOwner={false}
          />
        ))}
      </div>
      <ProfilePagination totalCount={bookmarkedCount} pageSize={pageSize} />
    </>
  );
};

export default ProfileBookmarkTabClient;
