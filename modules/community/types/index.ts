import { Database } from '@/types/supabase';
import {
  createCommunityPostClientSchema,
  updateCommunityPostClientSchema,
} from '@/modules/community/schema';
import { POST_CATEGORIES } from '@/constants/community-file';
import { z } from 'zod';

// ── Database-derived types ────────────────────────────────────────────

export type CommunityPost =
  Database['public']['Tables']['community_posts']['Row'];

export type InsertCommunityPost =
  Database['public']['Tables']['community_posts']['Insert'];

export type UpdateCommunityPost =
  Database['public']['Tables']['community_posts']['Update'];

export type CommunityPostAttachment =
  Database['public']['Tables']['community_posts_attachments']['Row'];

export type InsertCommunityPostAttachment =
  Database['public']['Tables']['community_posts_attachments']['Insert'];

export type UpdateCommunityPostAttachment =
  Database['public']['Tables']['community_posts_attachments']['Update'];

// ── Enums & constants ─────────────────────────────────────────────────

export { POST_CATEGORIES };

export type PostCategory = keyof typeof POST_CATEGORIES;

// ── Form mode ─────────────────────────────────────────────────────────

export type FormMode = 'create' | 'update';

// ── Inferred form data types ──────────────────────────────────────────

export type CreateCommunityPostFormData = z.infer<
  typeof createCommunityPostClientSchema
>;

export type UpdateCommunityPostFormData = z.infer<
  typeof updateCommunityPostClientSchema
>;
