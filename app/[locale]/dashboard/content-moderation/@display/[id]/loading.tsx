import { Skeleton } from '@/components/ui/skeleton';

export default function DisplayLoading() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="space-y-6">
        <section>
          <Skeleton className="mb-4 h-6 w-48" />
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </section>

        <div className="bg-border h-px" />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="bg-card space-y-4 rounded-lg border p-6">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </section>

        <div className="bg-border h-px" />

        <section>
          <Skeleton className="mb-3 h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-1 h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
