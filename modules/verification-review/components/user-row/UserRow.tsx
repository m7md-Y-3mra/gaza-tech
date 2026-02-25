'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { VerificationQueueItem } from '@/modules/verification-review/types';

type UserRowProps = {
  item: VerificationQueueItem;
};

export default function UserRow({ item }: UserRowProps) {
  const params = useParams<{ id: string }>();
  const isActive = params?.id === item.verification_request_id;

  const initials = item.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <li>
      <Link
        href={`/dashboard/verification-review/${item.verification_request_id}`}
        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
          isActive
            ? 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : ''
        }`}
      >
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
            {item.full_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {item.submitted_at
              ? new Date(item.submitted_at).toLocaleDateString()
              : 'No date'}
          </p>
        </div>

        {/* Priority badge */}
        {item.priority && (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              item.priority === 'high'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : item.priority === 'low'
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            {item.priority}
          </span>
        )}
      </Link>
    </li>
  );
}
