import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SellerListingsProps } from './types';
import ProductCard from '@/modules/listings/components/listing-form/components/product-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import { CAROUSEL_CARD_NUM } from '@/constant';
import { getSellerListingsAction } from '@/modules/listings/actions';
import { getTranslations, getLocale } from 'next-intl/server';

const SellerListings = async ({
  sellerId,
  currentListingId,
}: SellerListingsProps) => {
  const t = await getTranslations('ListingDetails.SellerListings');
  const locale = await getLocale();

  // Fetch seller listings from Supabase
  const res = await getSellerListingsAction(
    sellerId,
    currentListingId,
    CAROUSEL_CARD_NUM
  );

  const listings = res.success ? res.data : [];

  // If no listings found, don't render the section
  if (!listings || listings.length === 0) {
    return null;
  }

  // Map listings to ProductCard props
  const products = listings.map((listing) => {
    // Database already filters for thumbnails, so just use first image
    const imageUrl = listing.listing_images?.[0]?.image_url || '';

    return {
      id: listing.listing_id,
      title: listing.title,
      price: listing.price,
      currency: listing.currency || 'USD',
      imageUrl,
      productCondition: listing.product_condition || 'used',
      locationName: listing.locations[0]?.name || '',
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Link
          href={`/profile/${sellerId}?tab=listings`}
          className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          {t('viewAll')}
          <ChevronRight className="size-5" />
        </Link>
      </div>

      {/* Listings Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: false,
          direction: locale === 'ar' ? 'rtl' : 'ltr',
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((listing) => (
            <CarouselItem
              key={listing.id}
              className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard {...listing} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" locale={locale} />
        <CarouselNext className="hidden md:flex" locale={locale} />
      </Carousel>
    </div>
  );
};

export default SellerListings;
