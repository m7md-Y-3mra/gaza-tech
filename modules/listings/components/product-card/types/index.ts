import { ProductCardData } from '@/modules/listings/listing-details/components/similar-products/types';

export type ProductCardProps = ProductCardData;

export type UseProductCardProps = {
  price: number;
  currency: string | null;
  productCondition: string;
};
