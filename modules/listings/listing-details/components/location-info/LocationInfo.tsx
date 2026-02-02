'use client';

import { MapPin, Clock, Hash } from 'lucide-react';
import type { LocationInfoProps } from './types';
import { useLocationInfo } from './hooks/useLocationInfo';
import { useTranslations } from 'next-intl';

const LocationInfo = ({
  locationName,
  createdAt,
  listingId,
}: LocationInfoProps) => {
  const t = useTranslations('ListingDetails.LocationInfo');
  const { relativeTime } = useLocationInfo({ createdAt });

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Location Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <div className="text-muted-foreground flex items-center gap-2">
            <MapPin className="size-5 shrink-0" />
            <span className="text-sm">{locationName}</span>
          </div>
        </div>

        {/* Listing Info Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('listingInfo')}</h3>
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="size-5 shrink-0" />
              <span className="text-sm">
                {t('postedTime', { time: relativeTime })}
              </span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2">
              <Hash className="size-5 shrink-0" />
              <span className="font-mono text-sm">{listingId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;
