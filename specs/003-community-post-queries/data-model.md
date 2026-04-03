# Data Model: Community Post Queries & Server Actions

**Date**: 2026-04-02  
**Feature**: 003-community-post-queries

## Entities

### community_posts (existing table)

| Field            | Type        | Constraints                                                        | Notes                           |
| ---------------- | ----------- | ------------------------------------------------------------------ | ------------------------------- |
| `post_id`        | uuid        | PK, auto-generated                                                 |                                 |
| `author_id`      | uuid        | FK → users.user_id, NOT NULL                                       | Set from authenticated user     |
| `title`          | text        | NOT NULL, min 5, max 100                                           | Validated by server schema      |
| `content`        | text        | NOT NULL, min 10, max 5000                                         | Validated by server schema      |
| `post_category`  | text        | CHECK: questions, tips, news, troubleshooting; default 'questions' | Validated by server schema enum |
| `content_status` | text        | CHECK: draft, published, removed; default 'draft'                  | Set to 'published' on create    |
| `published_at`   | timestamptz | nullable                                                           | Set to `now()` on create        |
| `created_at`     | timestamptz | auto                                                               |                                 |
| `updated_at`     | timestamptz | auto                                                               |                                 |

### community_posts_attachments (existing table)

| Field           | Type        | Constraints                            | Notes                     |
| --------------- | ----------- | -------------------------------------- | ------------------------- |
| `attachment_id` | uuid        | PK, auto-generated                     |                           |
| `post_id`       | uuid        | FK → community_posts.post_id, NOT NULL |                           |
| `file_url`      | text        | NOT NULL                               | URL from Supabase Storage |
| `created_at`    | timestamptz | auto                                   |                           |

## Relationships

- `community_posts.author_id` → `users.user_id` (many-to-one)
- `community_posts_attachments.post_id` → `community_posts.post_id` (many-to-one; max 5 attachments per post enforced at application level)

## Server Schema Types (new)

### CreateCommunityPostServerData

```
title: string (min 5, max 100)
content: string (min 10, max 5000)
post_category: 'questions' | 'tips' | 'news' | 'troubleshooting'
attachments: Array<{ url: string }> (optional, max 5)
```

### UpdateCommunityPostServerData

```
title: string (optional, min 5, max 100)
content: string (optional, min 10, max 5000)
post_category: 'questions' | 'tips' | 'news' | 'troubleshooting' (optional)
attachments: Array<{ url: string; isExisting?: boolean }> (optional, max 5)
```

## Query Return Types

### GetCommunityPostDetailsResult

```
community_posts row + community_posts_attachments[] (joined via post_id)
```

Fields returned: `post_id`, `author_id`, `title`, `content`, `post_category`, `content_status`, `published_at`, `created_at`, `updated_at`, and nested `community_posts_attachments` array with `attachment_id`, `file_url`, `created_at`.

## State Transitions

| From      | To        | Trigger       | Notes                                                  |
| --------- | --------- | ------------- | ------------------------------------------------------ |
| (none)    | published | Create action | `content_status = 'published'`, `published_at = now()` |
| published | published | Update action | Only content fields change; status stays published     |

Note: `draft` and `removed` states exist in the DB schema but are out of scope for this phase (no draft saving, no soft-delete).

## Attachment Diff Logic (Update)

1. Receive `attachments` array (mix of existing URLs and new URLs)
2. Fetch current attachments for the post from DB
3. **To delete**: Current DB rows whose `file_url` is NOT in the incoming array → DELETE
4. **To insert**: Incoming URLs that are NOT in the current DB rows → INSERT
5. **Unchanged**: URLs present in both → no action
