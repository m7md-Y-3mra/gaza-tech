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
import SimilarProducts from './components/similar-products';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { ListingDetailsPageProps } from './types';

const ListingDetailsPage = async ({ id }: ListingDetailsPageProps) => {
  // TODO: Fetch listing details in Stage 12
  // Mock data for now
  const mockImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
  ];

  const mockDescription = `This is a high-quality product in excellent condition. Perfect for everyday use with premium features and modern design.

The item has been well-maintained and comes from a smoke-free environment. All original accessories are included.

Feel free to contact me for more details or to arrange a viewing. Serious buyers only please.`;

  const mockSpecifications = [
    { label: 'Brand', value: 'Apple' },
    { label: 'Model', value: 'MacBook Pro 16"' },
    { label: 'Processor', value: 'M3 Max' },
    { label: 'RAM', value: '32GB' },
    { label: 'Storage', value: '1TB SSD' },
    { label: 'Graphics Card', value: 'Integrated' },
    { label: 'Display', value: '16.2" Liquid Retina XDR' },
    { label: 'Battery', value: 'Up to 22 hours' },
    { label: 'Operating System', value: 'macOS Sonoma' },
    { label: 'Warranty Status', value: 'AppleCare+ until 2025' },
    { label: 'Color', value: 'Space Black', isCustom: true },
  ];

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - 2 columns on large screens */}
        <div className="space-y-6 lg:col-span-2">
          <ProductGallery
            images={mockImages}
            listingId={id}
            title="Sample Product"
            productCondition="new"
          />
          <ProductDescription description={mockDescription} />
          <Specifications specifications={mockSpecifications} />
          <LocationInfo
            locationName="Gaza City"
            createdAt={new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()}
            listingId={id}
          />
        </div>

        {/* Sidebar - 1 column on large screens, sticky */}
        <div className="space-y-6 lg:sticky lg:top-4 lg:col-span-1 lg:self-start">
          <ProductInfoCard
            price={1299}
            currency="USD"
            title="Sample Product"
            categoryName="Electronics"
            phoneNumber="+1234567890"
          />
          <ErrorBoundary FallbackComponent={SellerInfoError}>
            <Suspense fallback={<SellerInfoSkeleton />}>
              <SellerInfo sellerId="mock-seller-id" />
            </Suspense>
          </ErrorBoundary>
          <SafetyTips />
        </div>
      </div>

      {/* Similar Products - Full width */}
      <div className="mt-12">
        <SimilarProducts categoryId="electronics" />
      </div>

      {/* Seller Listings - Full width */}
      <div className="mt-12">
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">Seller Listings (Stage 11)</p>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage;
