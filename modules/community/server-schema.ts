import z from 'zod';
import { POST_CATEGORIES } from '@/constants/community-file';

const POST_CATEGORY_VALUES = Object.keys(POST_CATEGORIES) as [
  keyof typeof POST_CATEGORIES,
  ...Array<keyof typeof POST_CATEGORIES>,
];

// ── Feed / comment query schemas ──────────────────────────────────────

export const postIdSchema = z.uuid();
export const commentIdSchema = z.uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(10)
    .transform((n) => Math.min(n, 50)),
});

export const commentContentSchema = z
  .string()
  .trim()
  .min(1, 'Comment cannot be empty')
  .max(2000, 'Comment is too long');

export const postCategorySchema = z.enum(POST_CATEGORY_VALUES).optional();

export const feedQuerySchema = paginationSchema.extend({
  category: postCategorySchema,
});

// ── Server schemas (no translation needed) ────────────────────────────

export const createCommunityPostServerSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10).max(5000),
  post_category: z.enum(POST_CATEGORY_VALUES),
  attachments: z
    .array(z.object({ url: z.string() }))
    .max(5)
    .optional(),
});

export const updateCommunityPostServerSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(10).max(5000).optional(),
  post_category: z.enum(POST_CATEGORY_VALUES).optional(),
  attachments: z
    .array(z.object({ url: z.string(), isExisting: z.boolean().optional() }))
    .max(5)
    .optional(),
});
