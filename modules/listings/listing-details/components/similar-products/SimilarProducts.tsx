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

const SimilarProducts = async ({ categoryId }: SimilarProductsProps) => {
  // TODO: Fetch similar products from Supabase in Stage 12
  // Mock data for now
  const mockProducts = [
    {
      id: 'similar-1',
      title: 'MacBook Pro 14" M3',
      price: 1099,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      productCondition: 'new',
      locationName: 'Gaza City',
    },
    {
      id: 'similar-2',
      title: 'MacBook Air M2',
      price: 899,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400',
      productCondition: 'like new',
      locationName: 'Khan Yunis',
    },
    {
      id: 'similar-3',
      title: 'iMac 24" M3',
      price: 1499,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      productCondition: 'new',
      locationName: 'Rafah',
    },
    {
      id: 'similar-4',
      title: 'Mac Mini M2',
      price: 599,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400',
      productCondition: 'good',
      locationName: 'Gaza City',
    },
    {
      id: 'similar-5',
      title: 'MacBook Pro 13" M2',
      price: 999,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
      productCondition: 'used',
      locationName: 'Deir al-Balah',
    },
    {
      id: 'similar-6',
      title: 'Mac Studio M2 Ultra',
      price: 2499,
      currency: 'USD',
      imageUrl:
        'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400',
      productCondition: 'new',
      locationName: 'Gaza City',
    },
  ];

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
          {mockProducts.map((product) => (
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
