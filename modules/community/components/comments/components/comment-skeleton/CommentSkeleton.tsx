'use client';

export function CommentSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="bg-muted h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-muted h-3 w-20 rounded" />
              <div className="bg-muted h-2 w-16 rounded" />
            </div>
            <div className="bg-muted h-3 w-full rounded" />
            <div className="bg-muted h-3 w-2/3 rounded" />
            <div className="flex gap-3 pt-1">
              <div className="bg-muted h-4 w-10 rounded" />
              <div className="bg-muted h-4 w-10 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
