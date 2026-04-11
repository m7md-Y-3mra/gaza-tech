-- RPC function contracts for Community Feed Queries (feature 006)
--
-- This file documents the Postgres functions to be created by the feature's
-- migration. Function bodies are illustrative; the real migration is applied
-- via `mcp__supabase__apply_migration` during Phase 2 implementation.
--
-- Conventions:
--   * All functions are SECURITY INVOKER so RLS still applies.
--   * All functions SET search_path = public to prevent search-path hijacking.
--   * Errors are raised via RAISE EXCEPTION with a known SQLSTATE or message
--     that the server action layer maps to CustomError codes
--     (POST_NOT_FOUND / COMMENT_NOT_FOUND / UNAUTHENTICATED).
--   * All snake_case. All timestamps timestamptz.
--   * Every paginated function internally fetches `limit + 1` rows so the
--     server action can compute `has_more` without a COUNT(*) round-trip.

-- =====================================================================
-- 1. get_community_feed
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_community_feed(
  p_page     integer DEFAULT 1,
  p_limit    integer DEFAULT 10,
  p_category text    DEFAULT NULL

RETURNS TABLE (
  post_id         uuid,
  title           text,
  content         text,
  post_category   text,
  published_at    timestamptz,
  author          jsonb,              -- { id, name, avatar_url }
  attachments     jsonb,              -- FeedAttachment[]
  like_count      bigint,
  comment_count   bigint,
  is_liked        boolean,
  is_bookmarked   boolean
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH page AS (
    SELECT cp.*
    FROM community_posts cp
    WHERE cp.content_status = 'published'
      AND (p_category IS NULL OR cp.post_category = p_category)
    ORDER BY cp.published_at DESC, cp.post_id DESC
    OFFSET GREATEST(p_page - 1, 0) * p_limit
    LIMIT p_limit + 1
  )
  SELECT
    p.post_id,
    p.title,
    p.content,
    p.post_category,
    p.published_at,
    COALESCE(
      jsonb_build_object(
        'id', u.user_id,
        'name', trim(coalesce(u.first_name, '') || ' ' || coalesce(u.last_name, '')),
        'avatar_url', u.avatar_url
      ),
      jsonb_build_object('id', NULL, 'name', 'Deleted user', 'avatar_url', NULL)
    ) AS author,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('attachment_id', a.attachment_id, 'file_url', a.file_url) ORDER BY a.created_at)
       FROM community_posts_attachments a WHERE a.post_id = p.post_id),
      '[]'::jsonb
    ) AS attachments,
    (SELECT count(*) FROM community_posts_likes l WHERE l.post_id = p.post_id) AS like_count,
    (SELECT count(*) FROM community_post_comments c WHERE c.post_id = p.post_id AND c.is_deleted = false) AS comment_count,
    EXISTS (
      SELECT 1 FROM community_posts_likes l
      WHERE l.post_id = p.post_id AND l.user_id = auth.uid()
    ) AS is_liked,
    EXISTS (
      SELECT 1 FROM bookmarked_posts b
      WHERE b.post_id = p.post_id AND b.user_id = auth.uid()
    ) AS is_bookmarked
  FROM page p
  LEFT JOIN users u ON u.user_id = p.author_id;
$$;

-- =====================================================================
-- 2. get_user_community_posts
-- =====================================================================
-- Same shape and ordering as get_community_feed, filtered by author_id.
CREATE OR REPLACE FUNCTION public.get_user_community_posts(
  p_user_id uuid,
  p_page    integer DEFAULT 1,
  p_limit   integer DEFAULT 10
)
RETURNS TABLE (/* same columns as get_community_feed */)
LANGUAGE sql SECURITY INVOKER SET search_path = public
AS $$
  -- Same body, with `WHERE cp.author_id = p_user_id AND cp.content_status = 'published'`
$$;

-- =====================================================================
-- 3. get_community_post_detail
-- =====================================================================
-- Single-row variant. Raises POST_NOT_FOUND for any non-published post,
-- even for the author (FR-017).
CREATE OR REPLACE FUNCTION public.get_community_post_detail(
  p_post_id uuid
)
RETURNS TABLE (/* same columns as get_community_feed, single row */)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT true INTO v_exists FROM community_posts
  WHERE post_id = p_post_id AND content_status = 'published';

  IF NOT COALESCE(v_exists, false) THEN
    RAISE EXCEPTION 'POST_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT /* same projection as get_community_feed */
  FROM community_posts cp
  LEFT JOIN users u ON u.user_id = cp.author_id
  WHERE cp.post_id = p_post_id;
END;
$$;

-- =====================================================================
-- 4. toggle_post_like
-- =====================================================================
CREATE OR REPLACE FUNCTION public.toggle_post_like(
  p_post_id uuid
)
RETURNS TABLE (is_liked boolean, like_count bigint)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_deleted_row record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = 'P0001';
  END IF;

  PERFORM 1 FROM community_posts
  WHERE post_id = p_post_id AND content_status = 'published';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'POST_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM community_posts_likes
  WHERE post_id = p_post_id AND user_id = v_user_id
  RETURNING * INTO v_deleted_row;

  IF FOUND THEN
    RETURN QUERY
      SELECT false, (SELECT count(*) FROM community_posts_likes WHERE post_id = p_post_id);
  ELSE
    INSERT INTO community_posts_likes (post_id, user_id) VALUES (p_post_id, v_user_id);
    RETURN QUERY
      SELECT true, (SELECT count(*) FROM community_posts_likes WHERE post_id = p_post_id);
  END IF;
END;
$$;

-- =====================================================================
-- 5. toggle_post_bookmark
-- =====================================================================
CREATE OR REPLACE FUNCTION public.toggle_post_bookmark(
  p_post_id uuid
)
RETURNS TABLE (is_bookmarked boolean)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_deleted_row record;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = 'P0001'; END IF;

  PERFORM 1 FROM community_posts
  WHERE post_id = p_post_id AND content_status = 'published';
  IF NOT FOUND THEN RAISE EXCEPTION 'POST_NOT_FOUND' USING ERRCODE = 'P0001'; END IF;

  DELETE FROM bookmarked_posts
  WHERE post_id = p_post_id AND user_id = v_user_id
  RETURNING * INTO v_deleted_row;

  IF FOUND THEN
    RETURN QUERY SELECT false;
  ELSE
    INSERT INTO bookmarked_posts (post_id, user_id) VALUES (p_post_id, v_user_id);
    RETURN QUERY SELECT true;
  END IF;
END;
$$;

-- =====================================================================
-- 6. toggle_comment_like
-- =====================================================================
CREATE OR REPLACE FUNCTION public.toggle_comment_like(
  p_comment_id uuid
)
RETURNS TABLE (is_liked boolean, like_count bigint)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_post_id uuid;
  v_is_deleted boolean;
  v_status text;
  v_deleted_row record;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = 'P0001'; END IF;

  SELECT c.post_id, c.is_deleted INTO v_post_id, v_is_deleted
  FROM community_post_comments c WHERE c.comment_id = p_comment_id;
  IF NOT FOUND OR v_is_deleted THEN
    RAISE EXCEPTION 'COMMENT_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  SELECT content_status INTO v_status FROM community_posts WHERE post_id = v_post_id;
  IF v_status IS DISTINCT FROM 'published' THEN
    RAISE EXCEPTION 'POST_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  DELETE FROM community_comments_likes
  WHERE comment_id = p_comment_id AND user_id = v_user_id
  RETURNING * INTO v_deleted_row;

  IF FOUND THEN
    RETURN QUERY
      SELECT false, (SELECT count(*) FROM community_comments_likes WHERE comment_id = p_comment_id);
  ELSE
    INSERT INTO community_comments_likes (comment_id, user_id) VALUES (p_comment_id, v_user_id);
    RETURN QUERY
      SELECT true, (SELECT count(*) FROM community_comments_likes WHERE comment_id = p_comment_id);
  END IF;
END;
$$;

-- =====================================================================
-- 7. add_comment (REPLACES existing function)
-- =====================================================================
-- Gates on content_status = 'published'; auto-rewrites deeper parents to
-- their top-level ancestor; rejects missing/tombstoned parents.
CREATE OR REPLACE FUNCTION public.add_comment(
  p_post_id           uuid,
  p_parent_comment_id uuid,     -- may be NULL for top-level
  p_content           text
)
RETURNS TABLE (/* CommentNode shape */)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_status text;
  v_parent record;
  v_new_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = 'P0001'; END IF;

  SELECT content_status INTO v_status FROM community_posts
  WHERE post_id = p_post_id FOR SHARE;
  IF v_status IS DISTINCT FROM 'published' THEN
    RAISE EXCEPTION 'POST_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  IF p_parent_comment_id IS NOT NULL THEN
    SELECT parent_comment_id, post_id, is_deleted
    INTO v_parent
    FROM community_post_comments WHERE comment_id = p_parent_comment_id;
    IF NOT FOUND OR v_parent.post_id <> p_post_id OR v_parent.is_deleted THEN
      RAISE EXCEPTION 'COMMENT_NOT_FOUND' USING ERRCODE = 'P0001';
    END IF;
    -- Auto-rewrite a reply's parent to its top-level ancestor.
    IF v_parent.parent_comment_id IS NOT NULL THEN
      p_parent_comment_id := v_parent.parent_comment_id;
    END IF;
  END IF;

  INSERT INTO community_post_comments (post_id, author_id, parent_comment_id, content)
  VALUES (p_post_id, v_user_id, p_parent_comment_id, p_content)
  RETURNING comment_id INTO v_new_id;

  RETURN QUERY
  SELECT c.comment_id, c.post_id,
         jsonb_build_object('id', u.user_id,
                            'name', trim(coalesce(u.first_name,'')||' '||coalesce(u.last_name,'')),
                            'avatar_url', u.avatar_url) AS author,
         c.content, c.parent_comment_id, c.is_edited, c.edited_at,
         c.is_deleted, c.created_at,
         0::bigint AS like_count, false AS is_liked
  FROM community_post_comments c
  LEFT JOIN users u ON u.user_id = c.author_id
  WHERE c.comment_id = v_new_id;
END;
$$;

-- =====================================================================
-- 8. get_post_comments
-- =====================================================================
-- Returns top-level comments with inline capped replies and replies_count.
-- See research.md §8 for the query structure.
CREATE OR REPLACE FUNCTION public.get_post_comments(
  p_post_id uuid,
  p_page    integer DEFAULT 1,
  p_limit   integer DEFAULT 10
)
RETURNS TABLE (/* TopLevelComment shape with replies jsonb + replies_count + has_more_replies */)
LANGUAGE sql SECURITY INVOKER SET search_path = public
AS $$
  -- See research.md §8 for the authoritative structure.
$$;

-- =====================================================================
-- 9. get_comment_replies
-- =====================================================================
-- Paginated "more replies" for a given top-level comment. Non-deleted only.
CREATE OR REPLACE FUNCTION public.get_comment_replies(
  p_comment_id uuid,
  p_page       integer DEFAULT 1,
  p_limit      integer DEFAULT 20
)
RETURNS TABLE (/* CommentNode shape */)
LANGUAGE sql SECURITY INVOKER SET search_path = public
AS $$
  SELECT c.comment_id, c.post_id, /* ... author jsonb ... */
         c.content, c.parent_comment_id, c.is_edited, c.edited_at,
         c.is_deleted, c.created_at,
         (SELECT count(*) FROM community_comments_likes l WHERE l.comment_id = c.comment_id) AS like_count,
         EXISTS (SELECT 1 FROM community_comments_likes l
                 WHERE l.comment_id = c.comment_id AND l.user_id = auth.uid()) AS is_liked
  FROM community_post_comments c
  LEFT JOIN users u ON u.user_id = c.author_id
  WHERE c.parent_comment_id = p_comment_id
    AND c.is_deleted = false
  ORDER BY c.created_at ASC, c.comment_id ASC
  OFFSET GREATEST(p_page - 1, 0) * p_limit
  LIMIT p_limit + 1;
$$;
