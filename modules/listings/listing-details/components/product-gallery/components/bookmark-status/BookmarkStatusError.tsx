'use client';

import { AlertCircle } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';
import { useTranslations } from 'next-intl';

const BookmarkStatusError = ({ error }: FallbackProps) => {
  const t = useTranslations('ListingDetails.BookmarkStatus');

  return (
    <div
      className="bg-background/80 rounded-full p-2 opacity-50 shadow-sm backdrop-blur-sm"
      title={t('error')}
    >
      <AlertCircle className="text-destructive size-5" />
    </div>
  );
};

export default BookmarkStatusError;
