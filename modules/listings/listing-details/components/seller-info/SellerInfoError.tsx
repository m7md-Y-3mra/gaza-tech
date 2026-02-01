'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

const SellerInfoError = () => {
  const t = useTranslations('ListingDetails.SellerInfo');

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="text-muted-foreground flex items-center gap-2">
        <AlertCircle className="size-5" />
        <p className="text-sm">{t('error')}</p>
      </div>
    </div>
  );
};

export default SellerInfoError;
