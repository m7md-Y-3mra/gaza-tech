import { formatPrice } from '@/modules/listings/utils/format-price';
import { UseProductInfoCardProps } from '../types';

export const useProductInfoCard = ({
  price,
  currency,
  phoneNumber,
}: UseProductInfoCardProps) => {
  const formattedPrice = formatPrice(price, currency);

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return {
    formattedPrice,
    handleCall,
  };
};
