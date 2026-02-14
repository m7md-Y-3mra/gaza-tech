import ListingCard from '../listing-card';

// Mock data
const mockListings = Array.from({ length: 8 }).map((_, i) => ({
  id: `listing-${i}`,
  title:
    i % 2 === 0
      ? 'MacBook Pro M2 Max 16-inch 32GB RAM'
      : 'iPhone 15 Pro Max 256GB Natural Titanium',
  price: i % 2 === 0 ? 2499 : 1199,
  currency: 'USD',
  image:
    'https://images.unsplash.com/photo-1517336714731-489679c1901a?q=80&w=1000&auto=format&fit=crop',
  location: 'Gaza City',
  condition: i % 3 === 0 ? 'New' : ('Used' as 'New' | 'Used'),
  sellerName: 'Tech Store',
  rating: 4.8,
  isVerified: true,
}));

const ListingsGrid = () => {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Listings</h2>
        <span className="text-muted-foreground text-sm">
          Showing {mockListings.length} results
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockListings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      <div className="mt-8 flex justify-center py-4">
        <div className="border-t-primary h-10 w-10 animate-spin rounded-full border-4 border-gray-200" />
      </div>
    </>
  );
};

export default ListingsGrid;
