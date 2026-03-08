'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateVerificationStatusAction } from '@/modules/verification-review/actions';
import {
  ChecklistState,
  DEFAULT_CHECKLIST,
  VerificationStatus,
} from '@/modules/verification-review/types';
import VerificationChecklist from '@/modules/verification-review/components/verification-checklist';
import ReviewNotes from '@/modules/verification-review/components/review-notes';
import ActionButtons from '@/modules/verification-review/components/action-buttons';

export default function ActionsIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: requestId } = use(params);
  const [checklist, setChecklist] = useState<ChecklistState>(DEFAULT_CHECKLIST);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChecklistChange = (key: keyof ChecklistState) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAction = async (status: VerificationStatus) => {
    setIsSubmitting(true);

    try {
      const result = await updateVerificationStatusAction({
        requestId,
        status,
        reviewNotes,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        checklist,
      });

      if (result.success) {
        toast.success(
          status === 'approved'
            ? 'Verification approved successfully'
            : 'Verification rejected successfully'
        );
        router.push('/dashboard/verification-review');
        router.refresh();
      } else {
        toast.error('Failed to update verification status');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Verification Tools
        </h2>
      </div>

      <div className="flex-1 space-y-6 p-4">
        <VerificationChecklist
          checklist={checklist}
          onChecklistChange={handleChecklistChange}
        />

        <ReviewNotes
          reviewNotes={reviewNotes}
          onReviewNotesChange={setReviewNotes}
          rejectionReason={rejectionReason}
          onRejectionReasonChange={setRejectionReason}
        />
      </div>

      <ActionButtons
        isSubmitting={isSubmitting}
        onApprove={() => handleAction('approved')}
        onReject={() => handleAction('rejected')}
      />
    </div>
  );
}
