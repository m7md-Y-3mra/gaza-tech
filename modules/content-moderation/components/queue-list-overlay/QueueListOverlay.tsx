'use client';

import React from 'react';
import { useQueuePending } from '../queue-pending-context/QueuePendingContext';

export function QueueListOverlay({ children }: { children: React.ReactNode }) {
  const { isPending } = useQueuePending();

  return (
    <div className="relative flex-1 overflow-hidden">
      {children}
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
    </div>
  );
}
