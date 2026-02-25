'use client';

import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

type ActionButtonsProps = {
  isSubmitting: boolean;
  onApprove: () => void;
  onReject: () => void;
  onSuspicious: () => void;
};

export default function ActionButtons({
  isSubmitting,
  onApprove,
  onReject,
  onSuspicious,
}: ActionButtonsProps) {
  return (
    <div className="space-y-2 border-t border-gray-200 p-4 dark:border-gray-700">
      <button
        onClick={onApprove}
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
        onClick={onReject}
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

      {/* <button
        onClick={onSuspicious}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-red-600 bg-transparent px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20 cursor-pointer"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        Mark as Suspicious
      </button> */}
    </div>
  );
}
