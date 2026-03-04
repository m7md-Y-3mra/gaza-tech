'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { formatMemberSince } from '@/utils/date.utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLocale, useTranslations } from 'next-intl';
import type { ProfileListingCardProps } from './types';

const ProfileListingCard = ({
  listing,
  isOwner,
  onDelete,
}: ProfileListingCardProps) => {
  const t = useTranslations('Profile.ListingCard');
  const locale = useLocale();

  const timeAgo = listing.created_at
    ? formatMemberSince(listing.created_at, locale)
    : '';

  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: listing.currency || 'USD',
    minimumFractionDigits: 0,
  }).format(listing.price);

  return (
    <div className="bg-card border-border hover:border-primary/50 rounded-xl border p-6 transition-colors">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <Link
          href={`/listings/${listing.listing_id}`}
          className="bg-muted size-24 shrink-0 overflow-hidden rounded-xl"
        >
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              width={96}
              height={96}
              className="size-full object-cover"
            />
          ) : (
            <div className="bg-muted size-full" />
          )}
        </Link>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <Link href={`/listings/${listing.listing_id}`}>
            <h3 className="mb-2 text-lg font-semibold">{listing.title}</h3>
          </Link>
          <p className="text-muted-foreground mb-3 line-clamp-1 text-sm">
            {listing.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-primary text-xl font-bold">{price}</span>
            <div className="flex items-center gap-3">
              {isOwner && (
                <>
                  <Link
                    href={`/listings/${listing.listing_id}/edit`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={t('editListing')}
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={t('deleteListing')}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('deleteDialogTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteDialogDescription', {
                            title: listing.title,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => onDelete?.(listing.listing_id)}
                        >
                          {t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileListingCard;
