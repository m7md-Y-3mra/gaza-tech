import { notFound } from 'next/navigation';
import ProductGallery from './components/product-gallery';
import ProductInfoCard from './components/product-info-card';
import ProductDescription from './components/product-description';
import Specifications from './components/specifications';
import LocationInfo from './components/location-info';
import SellerInfo, {
  SellerInfoSkeleton,
  SellerInfoError,
} from './components/seller-info';
import SafetyTips from './components/safety-tips';
import SimilarProducts, {
  SimilarProductsSkeleton,
  SimilarProductsError,
} from './components/similar-products';
import SellerListings, {
  SellerListingsSkeleton,
  SellerListingsError,
} from './components/seller-listings';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { ListingDetailsPageProps } from './types';
import { getListingDetailsAction } from '@/modules/listings/actions';

const ListingDetailsPage = async ({ id }: ListingDetailsPageProps) => {
  // Fetch listing details from Supabase
  const res = await getListingDetailsAction(id);
  const listing = res.success ? res.data : null;

  // Handle listing not found
  if (!listing) {
    notFound();
  }

  // Extract images from listing_images array and sort by sort_order
  const images =
    listing.listing_images
      ?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((img) => img.image_url) || [];

  // Parse specifications from JSON if stored as JSON, or use empty array
  const specifications = listing.specifications;

  // Get category name from joined data
  const categoryName =
    listing.marketplace_categories[0]?.name || 'Uncategorized';

  // Get location name from joined data
  const locationName = listing.locations[0]?.name || 'Unknown';

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - 2 columns on large screens */}
        <div className="space-y-6 lg:col-span-2">
          <ProductGallery
            images={images}
            listingId={listing.listing_id}
            title={listing.title}
            productCondition={listing.product_condition}
          />
          <ProductDescription description={listing.description} />
          <Specifications specifications={specifications} />
          <LocationInfo
            locationName={locationName}
            createdAt={listing.created_at || new Date().toISOString()}
            listingId={listing.listing_id}
          />
        </div>

        {/* Sidebar - 1 column on large screens, sticky */}
        <div className="space-y-6 lg:sticky lg:top-4 lg:col-span-1 lg:self-start">
          <ProductInfoCard
            price={listing.price}
            currency={listing.currency || 'USD'}
            title={listing.title}
            categoryName={categoryName}
            phoneNumber="+1234567890"
          />
          <ErrorBoundary FallbackComponent={SellerInfoError}>
            <Suspense fallback={<SellerInfoSkeleton />}>
              <SellerInfo sellerId={listing.seller_id} />
            </Suspense>
          </ErrorBoundary>
          <SafetyTips />
        </div>
      </div>

      {/* Similar Products - Full width */}
      <div className="mt-12">
        <ErrorBoundary fallbackRender={SimilarProductsError}>
          <Suspense fallback={<SimilarProductsSkeleton />}>
            <SimilarProducts
              categoryId={listing.category_id}
              currentListingId={listing.listing_id}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Seller Listings - Full width */}
      <div className="mt-12">
        <ErrorBoundary fallbackRender={SellerListingsError}>
          <Suspense fallback={<SellerListingsSkeleton />}>
            <SellerListings
              sellerId={listing.seller_id}
              currentListingId={listing.listing_id}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ListingDetailsPage;
