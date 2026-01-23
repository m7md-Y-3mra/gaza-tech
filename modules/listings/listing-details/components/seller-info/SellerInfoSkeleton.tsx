import { Skeleton } from '@/components/ui/skeleton';

const SellerInfoSkeleton = () => {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <Skeleton className="h-6 w-40" />

      <div className="flex items-start gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-8" />
        </div>
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
};

export default SellerInfoSkeleton;
