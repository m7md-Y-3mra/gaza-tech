# Data Model: Post Detail Modal

**Feature**: 009-post-detail-modal | **Date**: 2026-04-07

> No new database entities are introduced. This feature consumes existing tables and types. This document maps existing entities to their usage in the modal.

## Existing Entities (consumed, not created)

### FeedPost (from `community_posts` + joins)

| Field         | Type                                                   | Source                                         | Usage in Modal                 |
| ------------- | ------------------------------------------------------ | ---------------------------------------------- | ------------------------------ |
| post_id       | string (UUID)                                          | `community_posts.id`                           | Post identification, URL param |
| title         | string                                                 | `community_posts.title`                        | Displayed in modal header      |
| content       | string                                                 | `community_posts.content`                      | Full untruncated body          |
| post_category | `'questions' \| 'tips' \| 'news' \| 'troubleshooting'` | `community_posts.category`                     | Category badge                 |
| published_at  | string (ISO 8601)                                      | `community_posts.created_at`                   | Formatted relative date        |
| author        | AuthorStub                                             | Joined from `users`                            | Avatar + name display          |
| attachments   | FeedAttachment[]                                       | `community_posts_attachments`                  | Image gallery                  |
| like_count    | number                                                 | Aggregated from `community_posts_likes`        | Action bar count               |
| comment_count | number                                                 | Aggregated from `community_post_comments`      | Comment section header         |
| is_liked      | boolean                                                | Current user lookup in `community_posts_likes` | Like button state              |
| is_bookmarked | boolean                                                | Current user lookup in `bookmarked_posts`      | Bookmark button state          |

**Fetched via**: `getCommunityPostDetailAction({ post_id })`

### CommentNode (from `community_post_comments` + joins)

| Field             | Type              | Source                                            | Usage in Modal               |
| ----------------- | ----------------- | ------------------------------------------------- | ---------------------------- |
| comment_id        | string (UUID)     | `community_post_comments.id`                      | Comment identification       |
| post_id           | string (UUID)     | `community_post_comments.post_id`                 | Parent post reference        |
| author            | AuthorStub        | Joined from `users`                               | Avatar + name display        |
| content           | string            | `community_post_comments.content`                 | Comment body (1-2000 chars)  |
| parent_comment_id | string \| null    | `community_post_comments.parent_comment_id`       | Threading (null = top-level) |
| is_edited         | boolean           | Derived from `edited_at`                          | "(edited)" indicator         |
| edited_at         | string \| null    | `community_post_comments.edited_at`               | Edit timestamp               |
| is_deleted        | boolean           | `community_post_comments.is_deleted`              | Soft delete flag             |
| created_at        | string (ISO 8601) | `community_post_comments.created_at`              | Relative timestamp           |
| like_count        | number            | Aggregated from `community_comments_likes`        | Like button count            |
| is_liked          | boolean           | Current user lookup in `community_comments_likes` | Like button state            |

### TopLevelComment (extends CommentNode)

| Field            | Type          | Description                             |
| ---------------- | ------------- | --------------------------------------- |
| replies          | CommentNode[] | Array of reply comments (max depth = 1) |
| replies_count    | number        | Total number of replies                 |
| has_more_replies | boolean       | Whether more replies can be loaded      |

**Fetched via**: `getPostCommentsAction({ post_id, page, limit: 20 })`

### Pagination: Page\<T\>

| Field     | Type           | Description              |
| --------- | -------------- | ------------------------ |
| data      | T[]            | Current page items       |
| has_more  | boolean        | Whether next page exists |
| next_page | number \| null | Next page number or null |

## Client-Side State Shapes

### PostDetailContext (new — React context)

```typescript
type PostUpdatePayload = {
  post_id: string;
  like_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  comment_count?: number;
};

type PostDetailContextValue = {
  updatedPosts: Map<string, PostUpdatePayload>;
  updatePost: (payload: PostUpdatePayload) => void;
};
```

Purpose: Syncs post-level changes (likes, bookmarks, comment count) between modal and feed without refetching.

### CommentSectionState (local hook state)

```typescript
type CommentSectionState = {
  comments: TopLevelComment[];
  hasMore: boolean;
  currentPage: number;
  isLoading: boolean;
  replyingTo: { commentId: string; authorName: string } | null;
  editingCommentId: string | null;
};
```

## Validation Rules (existing schemas)

- Comment content: `z.string().trim().min(1).max(2000)` — defined in `modules/community/schema.ts`
- Post ID: UUID format — validated server-side in query functions

## State Transitions

### Comment Lifecycle

```
[Empty] → addComment → [Visible]
[Visible] → editComment → [Visible + "(edited)"]
[Visible] → deleteComment → [Removed] (cascade removes replies if parent)
```

### Comment Like

```
[Not Liked] → toggleLike → [Liked, count + 1]
[Liked] → toggleLike → [Not Liked, count - 1]
```

### Modal Navigation

```
[Feed] → click post card → [Modal Open, URL: /community/[id]]
[Modal Open] → close/escape/back → [Feed, URL: /community]
[Direct URL] → /community/[id] → [Full Page View]
```
