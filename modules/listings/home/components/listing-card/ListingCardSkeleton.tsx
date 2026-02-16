import { Skeleton } from '@/components/ui/skeleton';

const ListingCardSkeleton = () => {
  return (
    <div className="bg-card group relative overflow-hidden rounded-xl border">
      {/* Image Skeleton */}
      <div className="bg-muted relative aspect-4/3 overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-2 flex items-start justify-between">
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Price */}
        <div className="mb-3 flex items-baseline gap-1">
          <Skeleton className="h-7 w-24" />
        </div>

        {/* Footer (Seller & Location) */}
        <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>

          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCardSkeleton;
