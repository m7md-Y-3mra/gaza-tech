'use client';
import Image from 'next/image';
import { MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VerificationBadge } from '@/components/verification-badge';
import { ListingCardProps } from './types';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { isNew } from '@/modules/listings/utils/is-new';

const ListingCard = ({ listing }: ListingCardProps) => {
  const {
    listing_id,
    title,
    price,
    currency,
    image,
    location,
    sellerName,
    isVerified,
    product_condition,
  } = listing;

  const tForm = useTranslations('ListingForm');
  const conditionLabel = product_condition
    ? tForm(`condition.${product_condition}`)
    : null;

  return (
    <Link
      href={`/listings/${listing_id}`}
      className="group bg-card hover:border-primary relative block overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg"
    >
      {/* Image Container */}
      <div className="bg-muted relative aspect-4/3 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {conditionLabel && (
            <Badge
              variant={isNew(product_condition) ? 'default' : 'secondary'}
              className="backdrop-blur-md"
            >
              {conditionLabel}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        {/* <button className="bg-background/80 hover:bg-background hover:text-primary absolute top-3 right-3 rounded-full p-2 backdrop-blur-md transition-colors duration-200">
          <Bookmark className="size-4" />
        </button> */}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="group-hover:text-primary line-clamp-2 text-base font-semibold transition-colors">
            {title}
          </h3>
        </div>

        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-primary text-lg font-bold">
            {price.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs font-medium">
            {currency}
          </span>
        </div>

        <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <div className="bg-muted flex size-6 items-center justify-center rounded-full">
              <User className="text-muted-foreground size-3" />
            </div>
            <span className="max-w-[80px] truncate text-xs font-medium">
              {sellerName}
            </span>
            {isVerified && <VerificationBadge isVerified={true} size="sm" />}
          </div>

          <div className="text-muted-foreground flex items-center gap-1">
            <MapPin className="size-3" />
            <span className="text-xs">{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
