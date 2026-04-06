# Data Model: Post Card Component

**Feature**: 007-post-card-component
**Date**: 2026-04-06

## Overview

The Post Card Component is a pure frontend feature — it consumes existing data types from the community module and introduces no new database entities or server-side types. This document maps the existing data shapes to the card's internal needs.

## Existing Entities (consumed, not modified)

### FeedPost

**Source**: `modules/community/types/index.ts`
**Used as**: The single `post` prop for `PostCard`

| Field           | Type               | Card Usage                                                |
| --------------- | ------------------ | --------------------------------------------------------- |
| `post_id`       | `string`           | Passed to callbacks (`onOpenComments`), used in share URL |
| `author`        | `AuthorStub`       | Author header (avatar, name, profile link)                |
| `title`         | `string`           | Title display (1-line clamp), comment-open hotspot        |
| `content`       | `string`           | Content preview (2-line clamp), comment-open hotspot      |
| `post_category` | `string`           | Category badge color + label                              |
| `published_at`  | `string` (ISO)     | Relative/absolute time display                            |
| `attachments`   | `FeedAttachment[]` | Attachment indicator (count only)                         |
| `like_count`    | `number`           | Like count display (compact notation)                     |
| `comment_count` | `number`           | Comment count display (compact notation)                  |
| `is_liked`      | `boolean`          | Initial like state (optimistic toggle)                    |
| `is_bookmarked` | `boolean`          | Initial bookmark state (optimistic toggle)                |

### AuthorStub

**Source**: `modules/community/types/index.ts`

| Field        | Type             | Card Usage                                                           |
| ------------ | ---------------- | -------------------------------------------------------------------- |
| `id`         | `string \| null` | Profile link target; `null` = deleted author (no link)               |
| `name`       | `string`         | Display name; fallback `"Deleted user"` from `DELETED_USER_NAME_KEY` |
| `avatar_url` | `string \| null` | Avatar image; `null` = initials fallback                             |

### FeedAttachment

**Source**: `modules/community/types/index.ts`

| Field           | Type     | Card Usage                          |
| --------------- | -------- | ----------------------------------- |
| `attachment_id` | `string` | Not used by card                    |
| `file_url`      | `string` | Not used by card (gallery deferred) |

Only `attachments.length` is used for the attachment count indicator.

## New Types (card-internal)

### PostCardProps

```typescript
type PostCardProps = {
  post: FeedPost;
  onOpenComments: (postId: string) => void;
};
```

- `post`: Single flattened post object (no separate viewer prop)
- `onOpenComments`: Required callback; invoked by comment icon, title, and content preview

### CategoryColorMap

```typescript
type PostCategory = 'questions' | 'tips' | 'news' | 'troubleshooting';

type CategoryColors = {
  bg: string; // Tailwind bg class (light + dark)
  text: string; // Tailwind text class (light + dark)
};

type CategoryColorMap = Record<PostCategory, CategoryColors>;
```

### AvatarPalette

```typescript
// Fixed 6-color palette for initials avatar background
const AVATAR_PALETTE = [
  'bg-slate-500',
  'bg-red-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
] as const;
```

## State Transitions

### Like State Machine

```
Initial: { isLiked: post.is_liked, likeCount: post.like_count }

[Click (authenticated, not in-flight)] →
  Optimistic: { isLiked: !prev, likeCount: prev ± 1, inFlight: true }
  → Server success: { inFlight: false } (keep optimistic state)
  → Server failure: revert to previous + toast.error + { inFlight: false }

[Click (unauthenticated)] → redirect to sign-in
[Click (loading auth)] → no-op
[Click (in-flight)] → no-op
```

### Bookmark State Machine

```
Initial: { isBookmarked: post.is_bookmarked }

[Click (authenticated, not in-flight)] →
  Optimistic: { isBookmarked: !prev, inFlight: true }
  → Server success: toast.success + { inFlight: false }
  → Server failure: revert to previous + toast.error + { inFlight: false }

[Click (unauthenticated)] → redirect to sign-in
[Click (loading auth)] → no-op
[Click (in-flight)] → no-op
```

## Validation Rules

No form validation needed — the card is read-only and action-driven. The only validation is:

- Share URL: Must be same-origin pathname starting with `/`
- Redirect URL: Must be same-origin pathname starting with `/` (encoded)

## Relationships

```
PostCard ──uses──▶ FeedPost (prop)
PostCard ──uses──▶ AuthorStub (nested in FeedPost)
PostCard ──calls──▶ togglePostLikeAction (server action)
PostCard ──calls──▶ togglePostBookmarkAction (server action)
PostCard ──calls──▶ onOpenComments (callback prop)
PostCard ──uses──▶ useCurrentUser (shared hook)
PostCard ──uses──▶ usePostCard (local hook: optimistic state + handlers)
PostCardSkeleton ──mirrors──▶ PostCard (visual footprint only)
```
