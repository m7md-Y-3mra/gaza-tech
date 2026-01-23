'use client';

import { Share2, Bookmark, Images } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { cn } from '@/lib/utils';
import type { ProductGalleryProps } from './types';
import BadgeOverlaySkeleton from './components/badge-overlay/BadgeOverlaySkeleton';
import BadgeOverlayError from './components/badge-overlay/BadgeOverlayError';
import { useProductGallery } from './hooks/useProductGallery';
import BadgeOverlay from './components/badge-overlay';

const ProductGallery = ({
  images,
  listingId,
  title,
  productCondition,
}: ProductGalleryProps) => {
  const {
    selectedImageIndex,
    isBookmarked,
    handleShare,
    handleBookmark,
    handleThumbnailClick,
    isNew,
  } = useProductGallery({ images, title, productCondition });

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      {/* Main Image Container */}
      <div className="bg-muted relative aspect-video">
        {images.length > 0 ? (
          <Image
            src={images[selectedImageIndex]}
            alt={`${title} - Image ${selectedImageIndex + 1}`}
            fill
            className="object-cover"
            priority={selectedImageIndex === 0}
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            No images available
          </div>
        )}

        {/* Badges Overlay - Top Left */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium">
              NEW
            </span>
          )}
          <ErrorBoundary FallbackComponent={BadgeOverlayError}>
            <Suspense fallback={<BadgeOverlaySkeleton />}>
              <BadgeOverlay listingId={listingId} />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleShare}
            className="bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur-sm transition-colors"
            aria-label="Share listing"
          >
            <Share2 className="size-5" />
          </button>
          <button
            onClick={handleBookmark}
            className={cn(
              'bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur-sm transition-colors',
              isBookmarked && 'text-primary'
            )}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark listing'}
          >
            <Bookmark
              className={cn('size-5', isBookmarked && 'fill-current')}
            />
          </button>
        </div>

        {/* Image Counter - Bottom Right */}
        {images.length > 0 && (
          <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Images className="size-5" />
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 p-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-md border-2 transition-all',
                selectedImageIndex === index
                  ? 'border-primary ring-primary/20 ring-2'
                  : 'hover:border-muted-foreground/20 border-transparent'
              )}
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
      )}
    </div>
  );
};

export default ProductGallery;
