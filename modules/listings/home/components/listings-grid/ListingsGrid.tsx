import { ListingCardItem } from '@/modules/listings/queries';
import ListingCard from '../listing-card';

const ListingsGrid = ({
  listings,
  className,
}: {
  listings: ListingCardItem[];
  className?: string;
}) => {
  return (
    <div
      className={`${className} grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {listings.map((listing) => (
        <ListingCard key={listing.listing_id} listing={listing} />
      ))}
    </div>
  );
};

export default ListingsGrid;
