import { VerificationQueueItem } from '@/modules/verification-review/types';
import { SearchX, Users } from 'lucide-react';
import UserRow from '@/modules/verification-review/components/user-row';

type QueueListProps = {
  queue: VerificationQueueItem[];
  hasSearchQuery?: boolean;
};

export default function QueueList({ queue, hasSearchQuery }: QueueListProps) {
  if (queue.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
        {hasSearchQuery ? (
          <>
            <SearchX className="mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm font-medium">No users found</p>
            <p className="mt-1 text-xs">Try adjusting your search terms.</p>
          </>
        ) : (
          <>
            <Users className="mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm font-medium">No pending requests</p>
            <p className="mt-1 text-xs">
              All verification requests have been processed.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {queue.map((item) => (
        <UserRow key={item.verification_request_id} item={item} />
      ))}
    </ul>
  );
}
