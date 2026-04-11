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

// ── Feed / comment response types ────────────────────────────────────

export type AuthorStub = {
  id: string | null;
  name: string;
  avatar_url: string | null;
};

export type FeedAttachment = {
  attachment_id: string;
  file_url: string;
};

export type FeedPost = {
  post_id: string;
  author: AuthorStub;
  title: string;
  content: string;
  post_category: string;
  published_at: string;
  attachments: FeedAttachment[];
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
};

export type CommentNode = {
  comment_id: string;
  post_id: string;
  author: AuthorStub;
  content: string;
  parent_comment_id: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
  like_count: number;
  is_liked: boolean;
};

export type TopLevelComment = CommentNode & {
  replies: CommentNode[];
  replies_count: number;
  has_more_replies: boolean;
};

export type Page<T> = {
  data: T[];
  has_more: boolean;
  next_page: number | null;
};

export type PageWithCount<T> = Page<T> & {
  total_count: number;
};

export type TogglePostLikeResult = {
  is_liked: boolean;
  like_count: number;
};

export type TogglePostBookmarkResult = {
  is_bookmarked: boolean;
};

export type ToggleCommentLikeResult = {
  is_liked: boolean;
  like_count: number;
};

export type AddCommentResult = CommentNode;
export type EditCommentResult = CommentNode;

export type DeletePostResult = { post_id: string };
export type DeleteCommentResult = { comment_id: string };
