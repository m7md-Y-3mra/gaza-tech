export function PostCardSkeleton() {
  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-4">
      {/* Author header */}
      <div className="flex items-center gap-3">
        <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="bg-muted h-3.5 w-28 animate-pulse rounded" />
          <div className="bg-muted h-3 w-20 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
      </div>

      {/* Title */}
      <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />

      {/* Content lines */}
      <div className="space-y-1.5">
        <div className="bg-muted h-3.5 w-full animate-pulse rounded" />
        <div className="bg-muted h-3.5 w-5/6 animate-pulse rounded" />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4 pt-1">
        <div className="bg-muted h-7 w-14 animate-pulse rounded" />
        <div className="bg-muted h-7 w-14 animate-pulse rounded" />
        <div className="ms-auto flex gap-2">
          <div className="bg-muted h-7 w-7 animate-pulse rounded" />
          <div className="bg-muted h-7 w-7 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
