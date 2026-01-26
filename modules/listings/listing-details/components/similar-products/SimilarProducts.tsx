import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SimilarProductsProps } from './types';
import ProductCard from '@/modules/listings/components/product-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getSimilarListings } from '@/modules/listings/queries';
import { CAROUSEL_CARD_NUM } from '@/constant';

const SimilarProducts = async ({
  categoryId,
  currentListingId,
}: SimilarProductsProps) => {
  // Fetch similar products from Supabase
  const listings = await getSimilarListings(
    categoryId,
    currentListingId,
    CAROUSEL_CARD_NUM
  );

  // If no similar products, don't render the section
  if (!listings || listings.length === 0) {
    return null;
  }

  // Map listings to ProductCard props
  const products = listings.map((listing: any) => {
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
        <h2 className="text-2xl font-bold">Similar Products</h2>
        <Link
          href={`/listings?category=${categoryId}`}
          className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          View All
          <ChevronRight className="size-5" />
        </Link>
      </div>

      {/* Products Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product: any) => (
            <CarouselItem
              key={product.id}
              className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard {...product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default SimilarProducts;
