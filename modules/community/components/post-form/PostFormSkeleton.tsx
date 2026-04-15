import { Skeleton } from '@/components/ui/skeleton';

export const PostFormSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Title */}
      <Skeleton className="h-10 w-1/3" />

      <div className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Category Radio Grid */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* File Upload Placeholder */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
};
