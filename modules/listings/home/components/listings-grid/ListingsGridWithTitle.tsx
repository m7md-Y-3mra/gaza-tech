import { ListingCardItem } from '@/modules/listings/queries';
import ListingsGrid from './ListingsGrid';

const ListingsGridWithTitle = ({
  listings,
}: {
  listings: ListingCardItem[];
}) => {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Listings</h2>
        <span className="text-muted-foreground text-sm">
          Showing {listings.length} results
        </span>
      </div>

      <ListingsGrid listings={listings} />
    </>
  );
};

export default ListingsGridWithTitle;
