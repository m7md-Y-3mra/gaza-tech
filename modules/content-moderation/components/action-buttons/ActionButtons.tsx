'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'nextjs-toploader/app';
import {
  dismissReportAction,
  removeContentAction,
  banUserAction,
} from '../../actions';
import { ReportDetail } from '../../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import LoadingSubmittingSpinner from '@/components/loading-submitting-spinner/LoadingSubmittingSpinner';

interface ActionButtonsProps {
  report: ReportDetail;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ report }) => {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDismiss = async () => {
    setIsSubmitting(true);
    const result = await dismissReportAction({
      reportId: report.report_id,
      resolutionNotes: notes,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Dismissed');
      router.push('/dashboard/content-moderation');
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveContent = async () => {
    if (report.reported_content.type === 'user') return;

    setIsSubmitting(true);
    const result = await removeContentAction({
      reportId: report.report_id,
      contentType: report.reported_content.type,
      contentId:
        report.reported_post_id ||
        report.reported_listing_id ||
        report.reported_comment_id ||
        '',
      resolutionNotes: notes,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Remove Content');
      router.push('/dashboard/content-moderation');
    } else {
      toast.error(result.message);
    }
  };

  const handleBanUser = async () => {
    const userId =
      report.reported_user_id ||
      report.reported_content.data?.author_id ||
      report.reported_content.data?.seller_id;

    if (!userId) {
      toast.error('Could not identify user to ban');
      return;
    }

    setIsSubmitting(true);
    const result = await banUserAction({
      reportId: report.report_id,
      userId,
      reason: report.reason,
      resolutionNotes: notes,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Ban User');
      router.push('/dashboard/content-moderation');
    } else {
      toast.error(result.message);
    }
  };

  const isResolved = report.report_status !== 'pending';

  return (
    <div className="bg-muted/10 flex h-full flex-col p-6">
      <h2 className="mb-6 text-xl font-bold">Moderation Actions</h2>

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notes">Resolution Notes</Label>
          <Textarea
            id="notes"
            placeholder="Explain your decision (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            disabled={isSubmitting || isResolved}
          />
        </div>

        <div className="flex flex-col gap-3">
          {/* Dismiss Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                disabled={isSubmitting || isResolved}
              >
                Dismiss Report
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to dismiss this report?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark the report as dismissed without taking any
                  action on the content.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDismiss}>
                  Dismiss Report
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Remove Content Button (only for posts, listings, comments) */}
          {report.reported_content.type !== 'user' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isSubmitting || isResolved}
                >
                  Remove Content
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to remove this content? This action
                    cannot be undone.
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    The content will be hidden from all users. This action is
                    recorded in the moderation history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveContent}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Remove Content
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Ban User Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full font-bold"
                disabled={isSubmitting || isResolved}
              >
                Ban User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Ban this user from the platform?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently disable the user's account. They will no
                  longer be able to log in or use the platform.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBanUser}
                  className="bg-destructive text-destructive-foreground"
                >
                  Ban User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isSubmitting && (
        <div className="bg-background/50 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[1px]">
          <LoadingSubmittingSpinner />
        </div>
      )}

      {isResolved && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm font-medium text-green-800">
          This report has been resolved.
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
