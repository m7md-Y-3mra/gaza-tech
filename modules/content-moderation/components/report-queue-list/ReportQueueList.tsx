'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Flag, FileText, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportQueueItem } from '../../types';

interface ReportQueueListProps {
  items: ReportQueueItem[];
}

const ICON_MAP = {
  post: FileText,
  listing: Flag,
  comment: MessageSquare,
  user: User,
};

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  inappropriate: 'Inappropriate',
  harassment: 'Harassment',
  misleading: 'Misleading',
  fraud: 'Fraud',
  fraud_scam: 'Fraud / Scam',
  hate_speech: 'Hate Speech',
  other: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

const ReportQueueList: React.FC<ReportQueueListProps> = ({ items }) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const selectedId = params.id as string;
  const queryString = searchParams.toString();

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <Flag className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">No pending reports. Great job!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item) => {
        const Icon = ICON_MAP[item.content_type];
        const isSelected = selectedId === item.report_id;

        return (
          <Link
            key={item.report_id}
            href={`/dashboard/content-moderation/${item.report_id}${queryString ? `?${queryString}` : ''}`}
            className={cn(
              'flex flex-col gap-1 p-4 transition-colors hover:bg-muted/50',
              isSelected && 'bg-muted'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-muted p-1.5 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold capitalize">
                  {REASON_LABELS[item.reason] ?? item.reason}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: enUS,
                })}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {`By ${item.reporter_name}`}
              </span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase",
                item.report_status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                item.report_status === 'resolved' ? "bg-green-100 text-green-700" :
                "bg-gray-100 text-gray-700"
              )}>
                {STATUS_LABELS[item.report_status] ?? item.report_status}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ReportQueueList;
