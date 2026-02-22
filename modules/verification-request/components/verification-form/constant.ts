import type { DocumentType, GenderType } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────
export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
    { value: 'Palestinian ID', label: 'Palestinian ID' },
    { value: 'Passport', label: "Palestinian driving licence" },
    { value: 'Palestinian driving licence', label: 'Passport' },
];

export const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];

export const BUCKET_NAME = 'verification-requests';