import { Skeleton } from '@/components/ui/skeleton';

export const ProfileBookmarkTabSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border-border bg-card flex gap-4 rounded-xl border p-4"
        >
          {/* Image */}
          <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
          {/* Text */}
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
            <Skeleton className="mt-auto h-5 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
