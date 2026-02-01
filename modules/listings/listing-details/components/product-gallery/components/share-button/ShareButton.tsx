'use client';

import { Share2 } from 'lucide-react';
import { useShareButton } from './hooks';
import { ShareButtonProps } from './types';
import { useTranslations } from 'next-intl';

const ShareButton = ({ title }: ShareButtonProps) => {
  const { handleShare } = useShareButton(title);
  const t = useTranslations('ListingDetails.a11y');

  return (
    <button
      onClick={handleShare}
      className="bg-background/80 hover:bg-background focus-visible:ring-primary rounded-full p-2 shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label={t('shareButton')}
    >
      <Share2 className="size-5" />
    </button>
  );
};

export default ShareButton;
