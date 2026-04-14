'use client';

import React from 'react';
import { ReportDetail } from '../../types';
import ReportedPost from './components/reported-post/ReportedPost';
import ReportedListing from './components/reported-listing/ReportedListing';
import ReportedComment from './components/reported-comment/ReportedComment';
import ReportedUser from './components/reported-user/ReportedUser';
import ReportHistory from '../report-history/ReportHistory';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

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

const CONTENT_TYPE_HEADINGS: Record<string, string> = {
  post: 'Post Details',
  listing: 'Listing Details',
  comment: 'Comment Details',
  user: 'User Profile',
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  post: 'Post',
  listing: 'Listing',
  comment: 'Comment',
  user: 'User',
};

interface ReportedContentDisplayProps {
  report: ReportDetail;
}

const ReportedContentDisplay: React.FC<ReportedContentDisplayProps> = ({
  report,
}) => {
  const { type, data } = report.reported_content;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Report Header */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Reported Content</h2>

          <div className="bg-muted/30 flex items-start justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Reason:
                </span>
                <span className="text-sm font-bold uppercase">
                  {REASON_LABELS[report.reason] ?? report.reason}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Description:
                </span>
                <p className="text-sm italic">
                  {report.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-muted-foreground text-xs">Reporter:</span>
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={report.reporter.avatar_url || ''} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold">
                    {report.reporter.first_name} {report.reporter.last_name}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                {format(new Date(report.created_at!), 'PPP p')}
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Content Preview */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">
              {CONTENT_TYPE_HEADINGS[type] ?? type}
            </h3>
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium uppercase">
              {CONTENT_TYPE_LABELS[type] ?? type}
            </span>
          </div>

          <div className="bg-card rounded-lg border shadow-sm">
            {type === 'post' && <ReportedPost post={data} />}
            {type === 'listing' && <ReportedListing listing={data} />}
            {type === 'comment' && <ReportedComment comment={data} />}
            {type === 'user' && <ReportedUser user={data} />}
            {!data && (
              <div className="text-muted-foreground p-8 text-center">
                Content not found.
              </div>
            )}
          </div>
        </section>

        <Separator />

        {/* Report History */}
        <section>
          <ReportHistory history={report.history} />
        </section>
      </div>
    </div>
  );
};

export default ReportedContentDisplay;
