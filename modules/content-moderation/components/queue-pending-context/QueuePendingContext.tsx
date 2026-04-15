'use client';

import React, {
  createContext,
  useContext,
  useTransition,
  startTransition as reactStartTransition,
} from 'react';

interface QueuePendingContextValue {
  isPending: boolean;
  startTransition: (fn: () => void) => void;
}

const QueuePendingContext = createContext<QueuePendingContextValue>({
  isPending: false,
  startTransition: reactStartTransition,
});

export function QueuePendingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <QueuePendingContext.Provider value={{ isPending, startTransition }}>
      {children}
    </QueuePendingContext.Provider>
  );
}

export function useQueuePending() {
  return useContext(QueuePendingContext);
}
