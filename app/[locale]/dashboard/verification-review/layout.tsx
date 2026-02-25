import { ReactNode } from 'react';

export default function VerificationReviewLayout({
  queue,
  display,
  actions,
}: {
  queue: ReactNode;
  display: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="grid h-[calc(100vh-64px)] grid-cols-[320px_1fr_360px] gap-4 p-4">
      <aside className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {queue}
      </aside>
      <main className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {display}
      </main>
      <aside className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {actions}
      </aside>
    </div>
  );
}
