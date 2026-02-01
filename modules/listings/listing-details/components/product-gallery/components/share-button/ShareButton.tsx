'use client';

import { Share2 } from 'lucide-react';
import { useShareButton } from './hooks';
import { ShareButtonProps } from './types';

const ShareButton = ({ title }: ShareButtonProps) => {
  const { handleShare } = useShareButton(title);
  return (
    <button
      onClick={handleShare}
      className="bg-background/80 hover:bg-background rounded-full p-2 shadow-sm backdrop-blur-sm transition-colors"
      aria-label="Share listing"
    >
      <Share2 className="size-5" />
    </button>
  );
};

export default ShareButton;
