'use client';

import {
  ChecklistState,
  CHECKLIST_LABELS,
} from '@/modules/verification-review/types';

type VerificationChecklistProps = {
  checklist: ChecklistState;
  onChecklistChange: (key: keyof ChecklistState) => void;
};

export default function VerificationChecklist({
  checklist,
  onChecklistChange,
}: VerificationChecklistProps) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        Document Verification Checklist
      </h3>
      <div className="space-y-2">
        {(Object.keys(CHECKLIST_LABELS) as (keyof ChecklistState)[]).map(
          (key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <input
                type="checkbox"
                checked={checklist[key]}
                onChange={() => onChecklistChange(key)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {CHECKLIST_LABELS[key]}
              </span>
            </label>
          )
        )}
      </div>
    </section>
  );
}
