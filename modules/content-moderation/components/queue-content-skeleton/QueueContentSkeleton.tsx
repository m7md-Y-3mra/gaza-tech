import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const QueueContentSkeleton: React.FC = () => {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-border flex flex-col divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default QueueContentSkeleton;
