import { ListingCardItem } from '@/modules/listings/queries';
import ListingCard from '../listing-card';

const ListingsGrid = ({ listings }: { listings: ListingCardItem[] }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.listing_id} listing={listing} />
      ))}
    </div>
  );
};

export default ListingsGrid;
