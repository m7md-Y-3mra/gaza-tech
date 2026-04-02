# Data Model: Community Post Schema

**Date**: 2026-04-01
**Feature**: 002-community-post-schema

## Entities

### Community Post (DB: `community_posts`)

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| post_id | UUID | Auto | — | Primary key, auto-generated |
| author_id | UUID | Yes | — | FK → users.user_id; set server-side |
| title | string | Yes | min: 5, max: 100 | Translated error messages |
| content | string | Yes | min: 10, max: 5000 | Translated error messages |
| post_category | enum | Yes | `questions` \| `tips` \| `news` \| `troubleshooting` | Default: `questions` (schema-level) |
| content_status | string \| null | No | — | Server-managed |
| published_at | string \| null | No | — | Server-managed |
| created_at | string \| null | No | — | Auto-generated |
| updated_at | string \| null | No | — | Auto-generated |

**Relationships**:
- `author_id` → `users.user_id` (many-to-one)
- One-to-many → `community_posts_attachments`

### Community Post Attachment (DB: `community_posts_attachments`)

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| attachment_id | UUID | Auto | — | Primary key, auto-generated |
| post_id | UUID | Yes | — | FK → community_posts.post_id |
| file_url | string | Yes | Valid URL | Supabase storage URL |
| created_at | string \| null | No | — | Auto-generated |

**Relationships**:
- `post_id` → `community_posts.post_id` (many-to-one)

## Form Schema Fields (Client-Side)

### Create Schema

| Field | Zod Type | Validation | Default |
|-------|----------|------------|---------|
| title | `z.string()` | min(5), max(100) | — |
| content | `z.string()` | min(10), max(5000) | — |
| post_category | `z.enum([...])` | restricted values | `'questions'` |
| attachments | `z.array(fileSchema).optional()` | max 5 items, each ≤5MB, MIME: image/* + PDF | `undefined` |

### Update Schema

Same as Create, except:
| Field | Change |
|-------|--------|
| attachments | `z.array(z.union([fileSchema, z.string().url()])).optional()` — accepts both File objects and existing URL strings |

## Type Exports

| Export Name | Source | Description |
|-------------|--------|-------------|
| `CommunityPost` | `Database['public']['Tables']['community_posts']['Row']` | Full DB row type |
| `InsertCommunityPost` | `...['Insert']` | Insert type |
| `UpdateCommunityPost` | `...['Update']` | Update type |
| `CommunityPostAttachment` | `Database['public']['Tables']['community_posts_attachments']['Row']` | Full attachment row |
| `InsertCommunityPostAttachment` | `...['Insert']` | Insert attachment type |
| `UpdateCommunityPostAttachment` | `...['Update']` | Update attachment type |
| `PostCategory` | Derived from enum values | Union type of category strings |
| `FormMode` | `'create' \| 'update'` | Form mode discriminator |
| `CreateCommunityPostFormData` | Inferred from create schema | Form data type for create |
| `UpdateCommunityPostFormData` | Inferred from update schema | Form data type for update |

## File Validation Constants

| Constant | Value | Notes |
|----------|-------|-------|
| `MAX_COMMUNITY_UPLOAD_SIZE` | `5 * 1024 * 1024` (5MB) | Per-file limit |
| `MAX_COMMUNITY_ATTACHMENTS` | `5` | Max files per post |
| `ACCEPTED_COMMUNITY_FILE_TYPES` | `['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']` | Images + PDF |
