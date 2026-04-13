import { Skeleton } from '@/components/ui/skeleton';

export default function ActionsLoading() {
  return (
    <div className="bg-muted/10 flex h-full flex-col p-6">
      <Skeleton className="mb-6 h-6 w-32" />

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
