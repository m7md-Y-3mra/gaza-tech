'use client';

import { Phone } from 'lucide-react';
import type { ProductInfoCardProps } from './types';
import { useProductInfoCard } from './hooks/useProductInfoCard';
import { useTranslations } from 'next-intl';

const ProductInfoCard = ({
  price,
  currency,
  title,
  categoryName,
  phoneNumber,
}: ProductInfoCardProps) => {
  const t = useTranslations('ListingDetails.ProductInfoCard');
  const { formattedPrice, handleCall } = useProductInfoCard({
    price,
    currency,
    phoneNumber,
  });
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      {/* Price */}
      <div className="space-y-1">
        <p className="text-primary text-3xl font-bold">{formattedPrice}</p>
        <p className="text-muted-foreground text-sm">{currency}</p>
      </div>

      {/* Title */}
      <h1 className="text-2xl leading-tight font-semibold">{title}</h1>

      {/* Category Tag */}
      <div className="flex gap-2">
        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">
          {categoryName}
        </span>
      </div>

      {/* Call Seller Button */}
      <button
        onClick={handleCall}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={useTranslations('ListingDetails.a11y')('callSeller')}
      >
        <Phone className="size-5" />
        {t('callSeller')}
      </button>
    </div>
  );
};

export default ProductInfoCard;
