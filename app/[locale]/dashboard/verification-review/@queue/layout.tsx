import QueueSearch from '@/modules/verification-review/components/queue-search';
import { Users } from 'lucide-react';

export default function QueueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Users className="h-5 w-5" />
          Verification Queue
        </h2>
        <QueueSearch />
      </div>

      {/* Page content (list + pagination) injected here */}
      {children}
    </div>
  );
}
