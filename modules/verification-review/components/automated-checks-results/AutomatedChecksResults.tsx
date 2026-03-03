import { CheckBadge } from './components/check-badge';
import { OcrStatusBadge } from './components/ocr-status-badge';
import { ScoreBar } from './components/score-bar';
import { AutomatedChecksResultsProps } from './types';

export default function AutomatedChecksResults({
  request,
}: AutomatedChecksResultsProps) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        Automated Checks Results
      </h3>
      <div className="space-y-3">
        {/* OCR Processing Status */}
        <OcrStatusBadge
          status={request.ocr_status ?? null}
          error={request.ocr_error ?? null}
        />

        {/* Pass/Fail Badges */}
        <CheckBadge
          label="Duplicate Account"
          value={request.duplicate_check_passed ?? null}
        />
        <CheckBadge
          label="Blacklist Check"
          value={request.blacklist_check_passed ?? null}
        />
        <CheckBadge
          label="OCR Name Match"
          value={request.name_matches ?? null}
          passedLabel="Yes"
          failedLabel="No"
        />

        {/* Score Progress Bars */}
        <ScoreBar
          label="Face Match Score"
          value={
            request.face_match_score !== null &&
            request.face_match_score !== undefined
              ? Number(request.face_match_score)
              : null
          }
        />
        <ScoreBar
          label="Document Authenticity"
          value={
            request.document_authenticity_score !== null &&
            request.document_authenticity_score !== undefined
              ? Number(request.document_authenticity_score)
              : null
          }
        />
      </div>
    </section>
  );
}
