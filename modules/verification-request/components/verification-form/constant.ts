import type { DocumentType, GenderType } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────
export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
    { value: 'national_id', label: 'National ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'drivers_license', label: "Driver's License" },
];

export const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];

