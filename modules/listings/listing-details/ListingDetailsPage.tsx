import ProductGallery from './components/product-gallery';
import ProductInfoCard from './components/product-info-card';
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
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">
              Product Description (Stage 5)
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">Specifications (Stage 6)</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">Location Info (Stage 7)</p>
          </div>
        </div>

        {/* Sidebar - 1 column on large screens, sticky */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:col-span-1 lg:self-start">
          <ProductInfoCard
            price={1299}
            currency="USD"
            title="Sample Product"
            categoryName="Electronics"
            phoneNumber="+1234567890"
          />
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">Seller Info (Stage 8)</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">Safety Tips (Stage 9)</p>
          </div>
        </div>
      </div>

      {/* Similar Products - Full width */}
      <div className="mt-12">
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">Similar Products (Stage 10)</p>
        </div>
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
