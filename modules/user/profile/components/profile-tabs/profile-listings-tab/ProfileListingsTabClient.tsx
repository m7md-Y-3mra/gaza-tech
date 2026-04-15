'use client';

import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';
import ProfileListingCard from '../../profile-listing-card';
import ProfilePagination from '../../profile-pagination';
import { PackageSearch } from 'lucide-react';
import { deleteListingAction } from '@/modules/listings/actions';
import { useTranslations } from 'next-intl';
import type { ProfileListingsTabClientProps } from './types';
import type { ProfileListingItem } from '@/modules/user/types';

const ProfileListingsTabClient = ({
  listings,
  listingsCount,
  isOwner,
  pageSize,
}: ProfileListingsTabClientProps) => {
  const t = useTranslations('Profile.ListingsTab');
  const [, startTransition] = useTransition();

  const [optimisticListings, removeOptimisticListing] = useOptimistic(
    listings,
    (state: ProfileListingItem[], listingId: string) =>
      state.filter((item) => item.listing_id !== listingId)
  );

  const handleDelete = (listingId: string) => {
    startTransition(async () => {
      removeOptimisticListing(listingId);

      const result = await deleteListingAction(listingId);

      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(t('deleteSuccess'));
      }
    });
  };

  if (optimisticListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20 text-center">
        <PackageSearch className="text-muted-foreground mb-4 size-12 opacity-50" />
        <p className="text-muted-foreground font-medium">{t('noListings')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:px-0">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {optimisticListings.map((listing) => (
          <ProfileListingCard
            key={listing.listing_id}
            listing={listing}
            isOwner={isOwner}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {listingsCount > pageSize && (
        <ProfilePagination totalCount={listingsCount} pageSize={pageSize} />
      )}
    </div>
  );
};

export default ProfileListingsTabClient;
