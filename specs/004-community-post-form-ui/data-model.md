# Data Model: Community Post Form UI

**Date**: 2026-04-02 | **Feature**: 004-community-post-form-ui

This feature creates no new database entities. It provides a UI for creating/updating records in existing tables defined in Phase 2 & 3. This document defines the TypeScript types and data shapes used by the form UI layer.

## Existing Entities (from Phase 2 & 3)

### community_posts (DB table — no changes)

| Field          | Type        | Notes                                          |
| -------------- | ----------- | ---------------------------------------------- |
| post_id        | uuid (PK)   | Auto-generated                                 |
| author_id      | uuid (FK)   | References users table                         |
| title          | text        | 5–100 chars                                    |
| content        | text        | 10–5,000 chars, plain text                     |
| post_category  | text        | One of: questions, tips, news, troubleshooting |
| content_status | text        | draft, published, removed                      |
| published_at   | timestamptz | Set on publish                                 |
| created_at     | timestamptz | Auto                                           |
| updated_at     | timestamptz | Auto                                           |

### community_posts_attachments (DB table — no changes)

| Field         | Type        | Notes                      |
| ------------- | ----------- | -------------------------- |
| attachment_id | uuid (PK)   | Auto-generated             |
| post_id       | uuid (FK)   | References community_posts |
| file_url      | text        | Full URL to stored file    |
| created_at    | timestamptz | Auto                       |

## New UI Types

### PostFormInitialData

Used to pass existing post data from the server component to the client form in update mode.

| Field         | Type             | Notes                                   |
| ------------- | ---------------- | --------------------------------------- |
| title         | string           | Existing title                          |
| content       | string           | Existing content                        |
| post_category | PostCategory     | Existing category                       |
| attachments   | FileUploadItem[] | Mapped from community_posts_attachments |

Each existing attachment is mapped to a `FileUploadItem` with `{ id: attachment_id, preview: file_url, isThumbnail: false, isExisting: true }`.

### PostFormClientProps (discriminated union)

| Mode   | Fields                                                                 |
| ------ | ---------------------------------------------------------------------- |
| create | `mode: 'create'`                                                       |
| update | `mode: 'update'`, `postId: string`, `initialData: PostFormInitialData` |

### PostFormProps (server component)

| Field  | Type                 | Notes                    |
| ------ | -------------------- | ------------------------ |
| mode   | 'create' \| 'update' | Defaults to 'create'     |
| postId | string (optional)    | Required for update mode |

## Form Data Flow

```
[Route Page] → [PostForm (server)] → [PostFormClient (client)]
                  ↓ (update mode)
          getCommunityPostDetailsAction(postId)
                  ↓
          Map to PostFormInitialData
                  ↓
          Pass to PostFormClient as initialData
```

### Create Flow

1. User fills form → `usePostForm` validates with `createCreateCommunityPostClientSchema`
2. On submit → upload attachments via `useFileUploader` → get URLs
3. Call `createCommunityPostAction({ title, content, post_category, attachments: [{ url }] })`
4. On success → toast + redirect to `/community`
5. On failure → cleanup uploaded files + show error

### Update Flow

1. Server component fetches post + attachments → maps to `PostFormInitialData`
2. User edits form → `usePostForm` validates with `createUpdateCommunityPostClientSchema`
3. On submit → diff attachments (new files to upload, removed files to delete)
4. Upload new files → delete removed files from storage
5. Call `updateCommunityPostAction(postId, { title, content, post_category, attachments: [{ url, isExisting }] })`
6. On success → toast + redirect to `/community`
7. On failure → cleanup newly uploaded files + show error

## File Upload Config

| Property          | Value                                                         |
| ----------------- | ------------------------------------------------------------- |
| bucketName        | `'community-attachments'`                                     |
| pathPrefix        | `'community/'`                                                |
| maxFiles          | 5                                                             |
| maxSizeBytes      | 5,242,880 (5 MB)                                              |
| acceptedTypes     | image/jpeg, image/png, image/gif, image/webp, application/pdf |
| enableCompression | false                                                         |
| displayMode       | `'file-list'`                                                 |
