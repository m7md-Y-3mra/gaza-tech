import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto space-y-8 p-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-xl border p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-[350px] w-full rounded-xl border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
