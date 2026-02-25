import { Database } from '@/types/supabase';

// ─── DB Row Types ─────────────────────────────────────────────────────
export type VerificationRequestRow =
    Database['public']['Tables']['verification_requests']['Row'];

export type UserRow = Database['public']['Tables']['users']['Row'];

export type UserWithEmailRow =
    Database['public']['Views']['users_with_email']['Row'];

// ─── Queue Item (slim type for the sidebar list) ──────────────────────
export type VerificationQueueItem = {
    verification_request_id: string;
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    submitted_at: string | null;
    priority: string | null;
    verification_status: string | null;
};

// ─── Full Detail (for display panel) ──────────────────────────────────
export type VerificationRequestDetail = VerificationRequestRow;

export type VerificationUserDetail = UserWithEmailRow;

// ─── Checklist State ──────────────────────────────────────────────────
export type ChecklistState = {
    name_matches: boolean;
    age_verified: boolean;
    id_number_valid: boolean;
    address_verified: boolean;
    face_matches_id: boolean;
    document_not_expired: boolean;
    no_tampering_signs: boolean;
    selfie_is_live: boolean;
};

export const DEFAULT_CHECKLIST: ChecklistState = {
    name_matches: false,
    age_verified: false,
    id_number_valid: false,
    address_verified: false,
    face_matches_id: false,
    document_not_expired: false,
    no_tampering_signs: false,
    selfie_is_live: false,
};

// ─── Checklist Labels ─────────────────────────────────────────────────
export const CHECKLIST_LABELS: Record<keyof ChecklistState, string> = {
    name_matches: 'Name matches documents',
    age_verified: 'Age 18+ confirmed',
    id_number_valid: 'ID number valid format',
    address_verified: 'Address verified',
    face_matches_id: 'Face matches ID photo',
    document_not_expired: 'Document not expired',
    no_tampering_signs: 'No signs of tampering',
    selfie_is_live: 'Selfie shows live person',
};

// ─── Status & Priority Constants ──────────────────────────────────────
export const VERIFICATION_STATUSES = [
    'pending',
    'approved',
    'rejected',
    'suspicious',
    'expired',
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const PRIORITY_OPTIONS = ['high', 'normal', 'low'] as const;
export type Priority = (typeof PRIORITY_OPTIONS)[number];

// ─── Sort Options ─────────────────────────────────────────────────────
export const SORT_OPTIONS = [
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Priority', value: 'priority' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];
