'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ActionButtonsProps = {
  isSubmitting: boolean;
  onApprove: () => void;
  onReject: () => void;
};

type PendingAction = 'approved' | 'rejected' | null;

const DIALOG_CONFIG = {
  approved: {
    title: 'Approve Verification',
    description:
      'Are you sure you want to approve this verification request? The user will be granted verified seller status.',
    actionLabel: 'Yes, Approve',
    actionClass:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  },
  rejected: {
    title: 'Reject Verification',
    description:
      'Are you sure you want to reject this verification request? The user will be notified of the rejection.',
    actionLabel: 'Yes, Reject',
    actionClass: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  },
} as const;

export default function ActionButtons({
  isSubmitting,
  onApprove,
  onReject,
}: ActionButtonsProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const handleConfirm = () => {
    if (pendingAction === 'approved') onApprove();
    if (pendingAction === 'rejected') onReject();
    setPendingAction(null);
  };

  const config = pendingAction ? DIALOG_CONFIG[pendingAction] : null;

  return (
    <>
      <div className="space-y-2 border-t border-gray-200 p-4 dark:border-gray-700">
        <button
          onClick={() => setPendingAction('approved')}
          disabled={isSubmitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Approve Verification
        </button>

        <button
          onClick={() => setPendingAction('rejected')}
          disabled={isSubmitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Reject Verification
        </button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        {config && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{config.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {config.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={isSubmitting}
                className={config.actionClass}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {config.actionLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  );
}
