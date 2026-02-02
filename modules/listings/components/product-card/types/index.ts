import { ProductCardData } from '../../../types';

export type ProductCardProps = ProductCardData;

export type UseProductCardProps = {
  price: number;
  currency: string | null;
  productCondition: string;
};
