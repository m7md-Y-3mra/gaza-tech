'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useProductGallery } from '../../providers/ProductGalleryProvider';
import { useTranslations } from 'next-intl';

interface ThumbnailGridProps {
  images: string[];
  title: string;
}

const ThumbnailGrid = ({ images, title }: ThumbnailGridProps) => {
  const { selectedImageIndex, handleThumbnailClick } = useProductGallery();
  const t = useTranslations('ListingDetails.a11y');

  if (images <= 1) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => handleThumbnailClick(index)}
          className={cn(
            'focus-visible:ring-primary relative aspect-square overflow-hidden rounded-md border-2 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            selectedImageIndex === index
              ? 'border-primary ring-primary/20 ring-2'
              : 'hover:border-muted-foreground/20 border-transparent'
          )}
          aria-label={t('thumbnailImage', {
            index: index + 1,
            total: images.length,
          })}
          aria-pressed={selectedImageIndex === index}
        >
          <Image
            src={image}
            alt={`${title} - Thumbnail ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 10vw"
          />
        </button>
      ))}
    </div>
  );
};

export default ThumbnailGrid;
