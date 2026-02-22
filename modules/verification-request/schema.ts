import { z, ZodType } from 'zod';
import { Database } from '@/types/supabase';
import { TranslationFunction } from '@/types';
import { DOCUMENT_TYPES } from './types';

// ─── Raw DB types ─────────────────────────────────────────────────────
type VerificationRequestRow =
  Database['public']['Tables']['verification_requests']['Row'];
type VerificationRequestInsert =
  Database['public']['Tables']['verification_requests']['Insert'];

// ─── Base row schema (full table shape) ───────────────────────────────
const createBaseVerificationSchema = (t: TranslationFunction) =>
  z.object({
    verification_request_id: z.uuid(),
    user_id: z.uuid(),

    // Personal info
    id_full_name: z
      .string({ message: t('fullNameRequired') })
      .min(3, t('fullNameMin'))
      .max(100, t('fullNameMax')),

    id_date_of_birth: z
      .string({ message: t('dateOfBirthRequired') })
      .min(1, t('dateOfBirthRequired')),

    id_gender: z.string().nullable(),

    national_id_number: z
      .string({ message: t('nationalIdRequired') })
      .length(9, t('nationalIdLength')),

    // Address
    address: z
      .string({ message: t('addressRequired') })
      .min(5, t('addressMin')),

    // Document
    document_type: z.enum(DOCUMENT_TYPES, {
      message: t('documentTypeRequired'),
    }),
    document_front_url: z
      .string({ message: t('documentFrontRequired') })
      .min(1),
    document_back_url: z.string({ message: t('documentBackRequired') }).min(1),
    selfie_with_id_url: z.string({ message: t('selfieRequired') }).min(1),

    // Phone
    phone_verified: z.boolean().nullable(),

    // Nullable admin / system fields
    address_verified: z.boolean().nullable(),
    age_verified: z.boolean().nullable(),
    assigned_to: z.string().nullable(),
    blacklist_check_passed: z.boolean().nullable(),
    created_at: z.string().nullable(),
    document_authenticity_score: z.number().nullable(),
    document_not_expired: z.boolean().nullable(),
    documents_verified: z.boolean().nullable(),
    duplicate_check_passed: z.boolean().nullable(),
    email_verified: z.boolean().nullable(),
    expires_at: z.string().nullable(),
    face_match_score: z.number().nullable(),
    face_matches_id: z.boolean().nullable(),
    id_number_valid: z.boolean().nullable(),
    name_matches: z.boolean().nullable(),
    no_tampering_signs: z.boolean().nullable(),
    phone_otp_attempts: z.number().nullable(),
    phone_otp_code: z.string().nullable(),
    phone_otp_expires_at: z.string().nullable(),
    priority: z.string().nullable(),
    rejection_reason: z.string().nullable(),
    review_notes: z.string().nullable(),
    reviewed_at: z.string().nullable(),
    selfie_is_live: z.boolean().nullable(),
    submitted_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    verification_status: z.string().nullable(),
  }) satisfies ZodType<VerificationRequestRow>;

// ─── Insert schema (fields the client submits) ────────────────────────
const createInsertVerificationSchema = (t: TranslationFunction) =>
  createBaseVerificationSchema(t).pick({
    id_full_name: true,
    id_date_of_birth: true,
    id_gender: true,
    national_id_number: true,
    address: true,
    document_type: true,
    document_front_url: true,
    document_back_url: true,
    selfie_with_id_url: true,
    phone_verified: true,
  }) satisfies ZodType<
    Pick<
      VerificationRequestInsert,
      | 'id_full_name'
      | 'id_date_of_birth'
      | 'id_gender'
      | 'national_id_number'
      | 'address'
      | 'document_type'
      | 'document_front_url'
      | 'document_back_url'
      | 'selfie_with_id_url'
      | 'phone_verified'
    >
  >;

// ─── Client schema (file objects instead of storage URLs) ─────────────
export const createVerificationRequestClientSchema = (t: TranslationFunction) =>
  createInsertVerificationSchema(t)
    .omit({
      document_front_url: true,
      document_back_url: true,
      selfie_with_id_url: true,
    })
    .extend({
      document_front: z
        .instanceof(File, { message: t('documentFrontRequired') })
        .refine((f) => f.size > 0, t('documentFrontRequired')),

      document_back: z
        .instanceof(File, { message: t('documentBackRequired') })
        .refine((f) => f.size > 0, t('documentBackRequired')),

      selfie_with_id: z
        .instanceof(File, { message: t('selfieRequired') })
        .refine((f) => f.size > 0, t('selfieRequired')),

      // Phone numbers collected from the user and saved to users table on verify
      phone_number: z
        .string({ message: t('phoneRequired') })
        .regex(/^\+(970|972)\d{9}$/, t('phoneInvalidFormat')),

      whatsapp_number: z
        .string()
        .regex(/^\+(970|972)\d{9}$/, t('whatsappInvalidFormat'))
        .optional(),

      phone_verified: z
        .boolean()
        .refine((v) => v === true, { message: t('phoneVerificationRequired') }),

      terms_accepted: z
        .boolean()
        .refine((v) => v === true, { message: t('termsRequired') }),
    });

// ─── Server schema (image fields are uploaded storage URLs) ───────────
export const createVerificationRequestServerSchema = (t: TranslationFunction) =>
  createInsertVerificationSchema(t).extend({
    document_front_url: z
      .string({ message: t('documentFrontRequired') })
      .url(t('documentFrontRequired')),
    document_back_url: z
      .string({ message: t('documentBackRequired') })
      .url(t('documentBackRequired')),
    selfie_with_id_url: z
      .string({ message: t('selfieRequired') })
      .url(t('selfieRequired')),
  });

// ─── Static exports (type inference without translation lookup) ────────
const defaultT: TranslationFunction = (key: string) => key;

export const verificationRequestClientSchema =
  createVerificationRequestClientSchema(defaultT);

export const verificationRequestServerSchema =
  createVerificationRequestServerSchema(defaultT);

export type VerificationRequestClientValues = z.infer<
  typeof verificationRequestClientSchema
>;

export type VerificationRequestServerValues = z.infer<
  typeof verificationRequestServerSchema
>;
