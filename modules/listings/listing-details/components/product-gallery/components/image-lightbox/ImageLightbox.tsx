'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useProductGallery } from '../../providers/ProductGalleryProvider';
import { useImageLightbox } from './hooks/useImageLightbox';

interface ImageLightboxProps {
  images: string[];
  title: string;
}

const ImageLightbox = ({ images, title }: ImageLightboxProps) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 hover:text-red-500"
        onClick={closeLightbox}
        aria-label="Close lightbox"
      >
        <X className="size-6" />
      </Button>

      {/* Previous Button */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-1 z-50 text-white hover:bg-white/20 hover:text-white sm:left-4"
          onClick={handlePrevious}
          aria-label="Previous image"
        >
          <ChevronLeft className="size-6 sm:size-8" />
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

      {/* Next Button */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-1 z-50 text-white hover:bg-white/20 hover:text-white sm:right-4"
          onClick={handleNext}
          aria-label="Next image"
        >
          <ChevronRight className="size-6 sm:size-8" />
        </Button>
      )}

      {/* Counter */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/50 px-4 py-1 text-sm text-black backdrop-blur-md">
        {selectedImageIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageLightbox;
