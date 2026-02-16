import { ListingCardSkeleton } from '../listing-card';

const LoadMoreSkeleton = () => {
  return (
    <div className="col-span-1 mt-6 grid grid-cols-1 gap-6 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default LoadMoreSkeleton;
