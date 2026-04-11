export function CommunityHighlightsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
            <div className="bg-muted h-4 w-1/4 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
          <div className="space-y-2">
            <div className="bg-muted h-3 w-full animate-pulse rounded" />
            <div className="bg-muted h-3 w-4/5 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
