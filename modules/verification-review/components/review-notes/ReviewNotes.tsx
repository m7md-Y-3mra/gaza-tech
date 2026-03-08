'use client';

type ReviewNotesProps = {
  reviewNotes: string;
  onReviewNotesChange: (value: string) => void;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
};

export default function ReviewNotes({
  reviewNotes,
  onReviewNotesChange,
  rejectionReason,
  onRejectionReasonChange,
}: ReviewNotesProps) {
  return (
    <>
      <section>
        <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
          Reviewer Notes
        </h3>
        <textarea
          value={reviewNotes}
          onChange={(e) => onReviewNotesChange(e.target.value)}
          placeholder="Add your review notes here..."
          rows={4}
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
          Rejection Reason (if rejecting)
        </h3>
        <textarea
          value={rejectionReason}
          onChange={(e) => onRejectionReasonChange(e.target.value)}
          placeholder="Provide a reason for rejection..."
          rows={2}
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
      </section>
    </>
  );
}
