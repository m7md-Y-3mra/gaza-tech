import type { ProductGalleryProps } from './types';
import { ProductGalleryProvider } from './providers/ProductGalleryProvider';
import MainImageContainer from './components/main-image-container';
import ShareButton from './components/share-button';
import ProductBadge from './components/product-badge';
import BookmarkStatus from './components/bookmark-status';
import { ReportButton } from '@/modules/reports/components';
import ThumbnailGrid from './components/thumbnail-grid';
import ImageLightbox from './components/image-lightbox';
import { getTranslations } from 'next-intl/server';

const ProductGallery = async ({
  images,
  listingId,
  title,
  productCondition,
  sellerId,
}: ProductGalleryProps) => {
  const t = await getTranslations('ListingDetails.a11y');

  return (
    <ProductGalleryProvider>
      <div
        className="bg-card overflow-hidden rounded-lg border"
        role="region"
        aria-label={t('productGallery')}
      >
        {/* Main Image Container */}
        <div className="bg-muted group relative aspect-video">
          <MainImageContainer images={images} title={title} />

          {/* Badges Overlay - Top Left (LTR) / Top Right (RTL) */}
          <div className="pointer-events-none absolute top-4 left-4 flex gap-2 rtl:right-4 rtl:left-auto">
            <ProductBadge productCondition={productCondition} />
          </div>

          {/* Action Buttons - Top Right (LTR) / Top Left (RTL) */}
          <div className="absolute top-4 right-4 flex gap-2 rtl:right-auto rtl:left-4">
            <ReportButton
              contentType="listing"
              contentId={listingId}
              contentOwnerId={sellerId}
              variant="secondary"
              className="bg-background/80 hover:bg-background h-10 w-10 rounded-full shadow-sm backdrop-blur-sm"
            />
            <BookmarkStatus listingId={listingId} />
            <ShareButton title={title} />
          </div>
        </div>

        {/* Thumbnail Grid */}
        <ThumbnailGrid images={images} title={title} />

        {/* Lightbox */}
        <ImageLightbox images={images} title={title} />
      </div>
    </ProductGalleryProvider>
  );
};

export default ProductGallery;
