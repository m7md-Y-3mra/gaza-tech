'use client';

import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportHistoryProps {
  history: {
    report_id: string;
    reason: string;
    created_at: string;
    report_status: string;
  }[];
}

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

const ReportHistory: React.FC<ReportHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div>
        <h3 className="mb-4 text-lg font-bold">Report History</h3>
        <p className="text-muted-foreground text-sm italic">
          No previous reports for this content.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">Report History</h3>
      <div className="space-y-3">
        {history.map((h) => (
          <div
            key={h.report_id}
            className="flex items-center justify-between rounded-md border p-3 text-sm"
          >
            <div className="space-y-1">
              <span className="font-semibold uppercase">
                {REASON_LABELS[h.reason] ?? h.reason}
              </span>
              <p className="text-muted-foreground text-xs">
                {format(new Date(h.created_at), 'PPP p')}
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                h.report_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : h.report_status === 'resolved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
              )}
            >
              {STATUS_LABELS[h.report_status] ?? h.report_status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportHistory;
