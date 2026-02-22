import type { DocumentType, GenderType } from '../../types';

// ─── Locale-aware option getters ─────────────────────────────────────
export const getDocumentTypeOptions = (
  t: (key: string) => string
): { value: DocumentType; label: string }[] => [
  { value: 'Palestinian ID', label: t('documentType.palestinianId') },
  { value: 'Passport', label: t('documentType.passport') },
  {
    value: 'Palestinian driving licence',
    label: t('documentType.drivingLicence'),
  },
];

export const getGenderOptions = (
  t: (key: string) => string
): { value: GenderType; label: string }[] => [
  { value: 'male', label: t('gender.male') },
  { value: 'female', label: t('gender.female') },
];

export const BUCKET_NAME = 'verification-requests';
