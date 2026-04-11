'use client';

export function PostDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-muted h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <div className="bg-muted h-3 w-24 rounded" />
          <div className="bg-muted h-2 w-16 rounded" />
        </div>
      </div>
      <div className="bg-muted h-4 w-20 rounded" />
      <div className="bg-muted h-6 w-full rounded" />
      <div className="space-y-2">
        <div className="bg-muted h-3 w-full rounded" />
        <div className="bg-muted h-3 w-full rounded" />
        <div className="bg-muted h-3 w-2/3 rounded" />
      </div>
      <div className="flex gap-4 pt-2">
        <div className="bg-muted h-8 w-16 rounded" />
        <div className="bg-muted h-8 w-16 rounded" />
        <div className="bg-muted h-8 w-16 rounded" />
      </div>
    </div>
  );
}
