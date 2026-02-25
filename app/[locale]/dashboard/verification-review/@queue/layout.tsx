import { getVerificationQueueAction } from '@/modules/verification-review/actions';
import { VerificationQueueItem } from '@/modules/verification-review/types';
import QueueList from '@/modules/verification-review/components/queue-list';
import { Search, Users } from 'lucide-react';

export default async function QueueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getVerificationQueueAction();

  const queue: VerificationQueueItem[] = result.success ? result.data : [];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Users className="h-5 w-5" />
          Verification Queue
        </h2>

        {/* Search placeholder */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pr-3 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        <QueueList queue={queue} />
      </div>

      {/* Count */}
      <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {queue.length} pending request{queue.length !== 1 ? 's' : ''}
        </p>
      </div>

      {children}
    </div>
  );
}
