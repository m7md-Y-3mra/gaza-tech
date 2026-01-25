import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SellerListingsProps } from './types';
import ProductCard from '@/modules/listings/components/product-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const SellerListings = async ({
  sellerId,
  currentListingId,
}: SellerListingsProps) => {
  // TODO: Fetch seller listings from Supabase in Stage 12
  // Mock data for now
  const mockListings = [
    {
      id: 'seller-1',
      title: 'iPad Pro 12.9" M2',
      price: 799,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      productCondition: 'like new',
      locationName: 'Gaza City',
    },
    {
      id: 'seller-2',
      title: 'AirPods Pro 2nd Gen',
      price: 199,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      productCondition: 'new',
      locationName: 'Gaza City',
    },
    {
      id: 'seller-3',
      title: 'Apple Watch Ultra',
      price: 699,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400',
      productCondition: 'good',
      locationName: 'Gaza City',
    },
    {
      id: 'seller-4',
      title: 'Magic Keyboard',
      price: 149,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
      productCondition: 'new',
      locationName: 'Gaza City',
    },
    {
      id: 'seller-5',
      title: 'HomePod Mini',
      price: 89,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400',
      productCondition: 'new',
      locationName: 'Gaza City',
    },
    {
      id: 'seller-6',
      title: 'Apple Pencil 2nd Gen',
      price: 99,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',
      productCondition: 'like new',
      locationName: 'Gaza City',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">More from this Seller</h2>
        <Link
          href={`/profile/${sellerId}?tab=listings`}
          className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          View All
          <ChevronRight className="size-5" />
        </Link>
      </div>

      {/* Listings Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {mockListings.map((listing) => (
            <CarouselItem
              key={listing.id}
              className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard {...listing} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default SellerListings;
