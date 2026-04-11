export function LatestListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="bg-muted aspect-video animate-pulse rounded-lg" />
          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/4 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
