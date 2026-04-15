'use client';

import React from 'react';
import { useQueryState } from 'nuqs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueuePending } from '../queue-pending-context/QueuePendingContext';

const ReportQueueFilters: React.FC = () => {
  const { startTransition } = useQueuePending();

  const [contentType, setContentType] = useQueryState('contentType', {
    defaultValue: 'all',
    shallow: false,
    startTransition,
  });

  const [status, setStatus] = useQueryState('status', {
    defaultValue: 'pending',
    shallow: false,
    startTransition,
  });

  return (
    <div className="flex gap-2">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="dismissed">Dismissed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={contentType} onValueChange={setContentType}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="post">Posts</SelectItem>
          <SelectItem value="listing">Listings</SelectItem>
          <SelectItem value="comment">Comments</SelectItem>
          <SelectItem value="user">Users</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ReportQueueFilters;
