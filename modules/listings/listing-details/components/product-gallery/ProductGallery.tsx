import type { ProductGalleryProps } from './types';
import { ProductGalleryProvider } from './providers/ProductGalleryProvider';
import MainImageContainer from './components/main-image-container';
import ShareButton from './components/share-button';
import ProductBadge from './components/product-badge';
import BookmarkStatus from './components/bookmark-status';
import ThumbnailGrid from './components/thumbnail-grid';
import ImageLightbox from './components/image-lightbox';

const ProductGallery = ({
  images,
  listingId,
  title,
  productCondition,
}: ProductGalleryProps) => {
  return (
    <ProductGalleryProvider>
      <div className="bg-card overflow-hidden rounded-lg border">
        {/* Main Image Container */}
        <div className="bg-muted group relative aspect-video">
          <MainImageContainer images={images} title={title} />

          {/* Badges Overlay - Top Left (LTR) / Top Right (RTL) */}
          <div className="pointer-events-none absolute top-4 left-4 flex gap-2 rtl:right-4 rtl:left-auto">
            <ProductBadge productCondition={productCondition} />
          </div>

          {/* Action Buttons - Top Right (LTR) / Top Left (RTL) */}
          <div className="absolute top-4 right-4 flex gap-2 rtl:right-auto rtl:left-4">
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
