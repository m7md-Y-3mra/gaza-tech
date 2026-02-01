'use client';

import { Images, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { useProductGallery } from '../../providers/ProductGalleryProvider';
import { MainImageContainerProps } from './types';
import { useTranslations } from 'next-intl';

const MainImageContainer = ({ images, title }: MainImageContainerProps) => {
  const { selectedImageIndex, openLightbox } = useProductGallery();
  const t = useTranslations('ListingDetails.a11y');

  if (images.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        No images available
      </div>
    );
  }

  return (
    <div className="relative h-full w-full" onClick={openLightbox}>
      <Image
        src={images[selectedImageIndex]}
        alt={`${title} - Image ${selectedImageIndex + 1}`}
        fill
        className="object-cover"
        priority={selectedImageIndex === 0}
      />

      {/* Image Counter - Bottom Right */}
      <div className="pointer-events-none absolute bottom-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm ltr:right-4 rtl:left-4">
        <Images className="size-5" />
        {selectedImageIndex + 1} / {images.length}
      </div>

      {/* Maximize Button - Center (Visible on Hover/Touch) */}
      <button
        onClick={openLightbox}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
        aria-label={t('lightboxDialog')}
      >
        <Maximize2 className="size-8" />
      </button>
    </div>
  );
};

export default MainImageContainer;
