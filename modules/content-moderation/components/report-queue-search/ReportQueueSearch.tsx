'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { Input } from '@/components/ui/input';
import { useQueuePending } from '../queue-pending-context/QueuePendingContext';

const ReportQueueSearch: React.FC = () => {
  const { startTransition } = useQueuePending();

  const [query, setQuery] = useQueryState('query', {
    defaultValue: '',
    shallow: false,
    throttleMs: 500,
    startTransition,
  });

  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder="Search reporters or content..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};

export default ReportQueueSearch;
