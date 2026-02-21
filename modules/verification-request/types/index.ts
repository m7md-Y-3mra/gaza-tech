// ─── Document types ───────────────────────────────────────────────────
export const DOCUMENT_TYPES_ENUM = {
    national_id: 'National ID',
    passport: 'Passport',
    drivers_license: "Driver's License"
} as const;
export type DocumentType = keyof typeof DOCUMENT_TYPES_ENUM;
export const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPES_ENUM) as DocumentType[];

export const GENDER_ENUM = {
    male: 'Male',
    female: 'Female',
};

// ─── Gender types ───────────────────────────────────────────────────
export type GenderType = keyof typeof GENDER_ENUM;
export const DOCUMENT_OPTIONS = Object.keys(GENDER_ENUM) as GenderType[];