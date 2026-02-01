'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useProductGallery } from '../../providers/ProductGalleryProvider';
import { useImageLightbox } from './hooks/useImageLightbox';
import { useLocale, useTranslations } from 'next-intl';

interface ImageLightboxProps {
  images: string[];
  title: string;
}

const ImageLightbox = ({ images, title }: ImageLightboxProps) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('ListingDetails.a11y');

  const {
    selectedImageIndex,
    isLightboxOpen,
    closeLightbox,
    setSelectedImageIndex,
  } = useProductGallery();

  const { handleNext, handlePrevious } = useImageLightbox({
    images,
    initialIndex: selectedImageIndex,
    isOpen: isLightboxOpen,
    onClose: closeLightbox,
    onIndexChange: setSelectedImageIndex,
  });

  if (!isLightboxOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t('lightboxDialog')}
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
        onClick={closeLightbox}
        aria-label={t('closeDialog')}
      >
        <X className="size-6" />
      </Button>

      {/* Previous Button - Left (LTR) / Right (RTL) */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="rtl:-left-auto absolute -left-1 z-50 text-white hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none sm:left-4 rtl:-right-1 sm:rtl:right-4 sm:rtl:left-auto"
          onClick={handlePrevious}
          aria-label={t('previousImage')}
        >
          {isRTL ? (
            <ChevronLeft className="size-6 sm:size-8" />
          ) : (
            <ChevronRight className="size-6 sm:size-8" />
          )}
        </Button>
      )}

      {/* Main Image */}
      <div className="relative h-[85vh] w-[85vw]">
        <Image
          src={images[selectedImageIndex]}
          alt={`${title} - Image ${selectedImageIndex + 1}`}
          fill
          className="object-contain"
          priority
          sizes="90vw"
        />
      </div>

      {/* Next Button - Right (LTR) / Left (RTL) */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="rtl:-right-auto absolute -right-1 z-50 text-white hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none sm:right-4 rtl:-left-1 sm:rtl:right-auto sm:rtl:left-4"
          onClick={handleNext}
          aria-label={t('nextImage')}
        >
          {isRTL ? (
            <ChevronRight className="size-6 sm:size-8" />
          ) : (
            <ChevronLeft className="size-6 sm:size-8" />
          )}
        </Button>
      )}

      {/* Counter - RTL format: total / current */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/50 px-4 py-1 text-sm text-black backdrop-blur-md">
        {isRTL
          ? `${images.length} / ${selectedImageIndex + 1}`
          : `${selectedImageIndex + 1} / ${images.length}`}
      </div>
    </div>
  );
};

export default ImageLightbox;
