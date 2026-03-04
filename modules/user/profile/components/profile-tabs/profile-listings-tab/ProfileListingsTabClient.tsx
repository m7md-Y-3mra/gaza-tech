'use client';

import ProfileListingCard from '../../profile-listing-card';
import ProfilePagination from '../../profile-pagination';
import { PackageSearch } from 'lucide-react';
import type { ProfileListingsTabClientProps } from './types';

const ProfileListingsTabClient = ({
  listings,
  listingsCount,
  isOwner,
  pageSize,
}: ProfileListingsTabClientProps) => {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20 text-center">
        <PackageSearch className="text-muted-foreground mb-4 size-12 opacity-50" />
        <p className="text-muted-foreground font-medium">No listings yet</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:px-0">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {listings.map((listing) => (
          <ProfileListingCard
            key={listing.listing_id}
            listing={listing}
            isOwner={isOwner}
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
