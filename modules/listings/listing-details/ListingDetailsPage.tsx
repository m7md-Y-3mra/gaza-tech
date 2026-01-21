import type { ListingDetailsPageProps } from './types';

const ListingDetailsPage =  async ({ id }: ListingDetailsPageProps) => {
  // TODO: Fetch listing details in Stage 12
  // For now, render placeholder structure
  
  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground">Product Gallery (Stage 3)</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground">Product Description (Stage 5)</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground">Specifications (Stage 6)</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground">Location Info (Stage 7)</p>
          </div>
        </div>

        {/* Sidebar - 1 column on large screens, sticky */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground">Product Info Card (Stage 4)</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground">Seller Info (Stage 8)</p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <p className="text-muted-foreground">Safety Tips (Stage 9)</p>
          </div>
        </div>
      </div>

      {/* Similar Products - Full width */}
      <div className="mt-12">
        <div className="bg-card rounded-lg p-6 border">
          <p className="text-muted-foreground">Similar Products (Stage 10)</p>
        </div>
      </div>

      {/* Seller Listings - Full width */}
      <div className="mt-12">
        <div className="bg-card rounded-lg p-6 border">
          <p className="text-muted-foreground">Seller Listings (Stage 11)</p>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage;
