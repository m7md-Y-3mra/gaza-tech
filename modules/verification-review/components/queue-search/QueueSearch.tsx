'use client';

import { Search } from 'lucide-react';
import { useQueryState, debounce } from 'nuqs';
import { queueSearchParams } from '@/modules/verification-review/search-params';

export default function QueueSearch() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'query',
    queueSearchParams.query.withOptions({ shallow: false })
  );

  const onSearchChange = (value: string) => {
    setSearchQuery(value, {
      // Send immediate update if clearing, otherwise debounce at 300ms
      limitUrlUpdates: value === '' ? undefined : debounce(300),
    });
  };

  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by name or ID..."
        className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pr-3 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
      />
    </div>
  );
}
