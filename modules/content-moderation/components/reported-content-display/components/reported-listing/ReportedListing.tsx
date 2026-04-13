'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, Tag, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ReportedListingProps {
  listing: any;
}

const ReportedListing: React.FC<ReportedListingProps> = ({ listing }) => {
  if (!listing) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={listing.seller?.avatar_url || ''} />
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{listing.seller?.first_name} {listing.seller?.last_name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(listing.created_at), 'PPP')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        {listing.listing_images && listing.listing_images.length > 0 && (
          <img
            src={listing.listing_images[0].image_url}
            alt={listing.title}
            className="h-40 w-full sm:w-40 rounded-md object-cover border"
          />
        )}
        <div className="flex-1 space-y-2">
          <h4 className="text-lg font-bold">{listing.title}</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
              <Tag className="h-4 w-4" />
              <span>{listing.price} {listing.currency}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{listing.locations?.name}</span>
            </div>
          </div>
          <p className="text-sm line-clamp-3">{listing.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportedListing;
