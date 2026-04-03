import { z } from 'zod';
import { TranslationFunction } from '@/types';
import {
  ACCEPTED_COMMUNITY_FILE_TYPES,
  MAX_COMMUNITY_ATTACHMENTS,
  MAX_COMMUNITY_UPLOAD_SIZE,
} from '@/constants/community-file';
import { POST_CATEGORIES } from '@/constants/community-file';

const POST_CATEGORY_VALUES = Object.keys(POST_CATEGORIES) as [
  keyof typeof POST_CATEGORIES,
  ...Array<keyof typeof POST_CATEGORIES>,
];

// ── File schema (factory) ─────────────────────────────────────────────

export const createCommunityFileSchema = (t: TranslationFunction) =>
  z
    .file()
    .max(MAX_COMMUNITY_UPLOAD_SIZE, t('attachmentMaxSize'))
    .mime(ACCEPTED_COMMUNITY_FILE_TYPES, t('attachmentInvalidType'));

// ── New attachment item schema (factory) — matches FileUploadItem without id ─

const createNewAttachmentSchema = (t: TranslationFunction) =>
  z.object({
    file: createCommunityFileSchema(t),
    preview: z.string(),
    isThumbnail: z.boolean(),
    isExisting: z.literal(false).optional(),
  });

// ── Existing attachment item schema — for update mode ────────────────

const existingAttachmentSchema = z.object({
  preview: z.string(),
  isThumbnail: z.boolean(),
  isExisting: z.literal(true),
});

// ── Create schema (factory) ───────────────────────────────────────────

export const createCreateCommunityPostClientSchema = (t: TranslationFunction) =>
  z.object({
    title: z
      .string({ message: t('titleRequired') })
      .min(5, t('titleMin'))
      .max(100, t('titleMax')),

    content: z
      .string({ message: t('contentRequired') })
      .min(10, t('contentMin'))
      .max(5000, t('contentMax')),

    post_category: z
      .enum(POST_CATEGORY_VALUES, { message: t('categoryRequired') })
      .default('questions'),

    attachments: z
      .array(createNewAttachmentSchema(t))
      .max(MAX_COMMUNITY_ATTACHMENTS, t('attachmentsMaxCount'))
      .optional(),
  });

// ── Update schema (factory) ───────────────────────────────────────────

export const createUpdateCommunityPostClientSchema = (t: TranslationFunction) =>
  z.object({
    title: z
      .string({ message: t('titleRequired') })
      .min(5, t('titleMin'))
      .max(100, t('titleMax')),

    content: z
      .string({ message: t('contentRequired') })
      .min(10, t('contentMin'))
      .max(5000, t('contentMax')),

    post_category: z
      .enum(POST_CATEGORY_VALUES, { message: t('categoryRequired') })
      .default('questions'),

    attachments: z
      .array(z.union([createNewAttachmentSchema(t), existingAttachmentSchema]))
      .max(MAX_COMMUNITY_ATTACHMENTS, t('attachmentsMaxCount'))
      .optional(),
  });

// ── Static exports (for type inference) ──────────────────────────────

const defaultT: TranslationFunction = (key: string) => key;

export const createCommunityPostClientSchema =
  createCreateCommunityPostClientSchema(defaultT);

export const updateCommunityPostClientSchema =
  createUpdateCommunityPostClientSchema(defaultT);
