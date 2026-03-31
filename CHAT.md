# Community Post Form — Spec Kit Implementation Plan

## Context

**Goal:** Build the Create / Update Community Post page.

**Stack:** Next.js 16, React 19, Supabase, react-hook-form + zod (v4), next-intl, Tailwind CSS 4, shadcn/ui (radix), sonner, lucide-react.

**Form Fields:** Title, Category (radio: questions | tips | news | troubleshooting), Content, Attachments (optional), Publish button (content_status → `published`).

**Existing Patterns to Follow:**

- Server Component (data-fetching) → Client Component (form logic) — see `ListingForm.tsx` → `ListingFormClient.tsx`
- `useForm` + `zodResolver` with schema factories that accept a translation function `t`
- Server actions in `actions.ts` wrapping query functions from `queries.ts` using `errorHandler()`
- Module-based folder structure under `modules/`

---

## Database Schema (from Supabase)

### `community_posts`

| Column           | Type              | Notes                                                                       |
| ---------------- | ----------------- | --------------------------------------------------------------------------- |
| `post_id`        | uuid (PK)         | auto-generated                                                              |
| `author_id`      | uuid (FK → users) | required                                                                    |
| `title`          | text              | required                                                                    |
| `content`        | text              | required                                                                    |
| `post_category`  | text              | CHECK: `questions`, `tips`, `news`, `troubleshooting` — default `questions` |
| `content_status` | text              | CHECK: `draft`, `published`, `removed` — default `draft`                    |
| `published_at`   | timestamptz       | nullable, set when publishing                                               |
| `created_at`     | timestamptz       | auto                                                                        |
| `updated_at`     | timestamptz       | auto                                                                        |

### `community_posts_attachments`

| Column          | Type                        | Notes          |
| --------------- | --------------------------- | -------------- |
| `attachment_id` | uuid (PK)                   | auto-generated |
| `post_id`       | uuid (FK → community_posts) | required       |
| `file_url`      | text                        | required       |
| `created_at`    | timestamptz                 | auto           |

---

## Phases Overview

| Phase | Spec Name                         | Summary                                                               |
| ----- | --------------------------------- | --------------------------------------------------------------------- |
| 1     | `reusable-file-upload`            | Extract a shared file upload component from the listings image upload |
| 2     | `community-post-schema`           | Zod schema + TypeScript types for community post create/update        |
| 3     | `community-post-queries`          | Supabase queries and server actions (CRUD)                            |
| 4     | `community-post-form-ui`          | The form page (route, server component, client component, hook)       |
| 5     | `community-post-form-integration` | Wire everything together, handle update mode, test the full flow      |

---

## Phase 1 — `reusable-file-upload`

**Goal:** Extract a reusable upload component from `modules/listings/components/listing-form/components/image-upload/` so both Listings and Community can share it.

### What to do

1. **Create `components/file-upload/`** (shared, not module-specific):
   - `hooks/useFileUploader.ts` — generic version of `useImageUploader.ts`. Instead of hardcoding `LISTING_BUCKET_NAME` and the `listings/` path prefix, accept `bucketName` and `pathPrefix` as params. Keep compression optional (images yes, other files no).
   - `hooks/useFileUpload.ts` — generic version of `useImageUpload.ts`, handles drag-and-drop, file selection, validation. Accept config: `maxFiles`, `maxSizeBytes`, `acceptedTypes`, `enableCompression`.
   - `reducers/fileReducer.ts` — same logic as `imageReducer.ts` but with generic naming. Remove `SET_THUMBNAIL` / `REORDER_IMAGES` actions if not needed for community (keep them optional or behind a config flag so listings still works).
   - `types/index.ts` — shared types (`FileUploadItem`, `FileUploadResult`, `FileUploadConfig`).
   - `FileUpload.tsx` — the UI component. Accept a `config` prop to control behavior (image grid vs. file list, thumbnail selection, etc.).
   - `index.ts` — barrel export.

2. **Refactor `modules/listings/.../image-upload/`** to use the new shared component internally, passing listing-specific config (`bucketName: LISTING_BUCKET_NAME`, `pathPrefix: 'listings/'`, `enableCompression: true`, `maxFiles: 8`, thumbnail support enabled).

3. **Verify** listings create & update still work identically after refactor.

### Spec Acceptance Criteria

- `components/file-upload/` exists and is fully typed
- Listings image upload uses it under the hood, zero behavioral change
- The shared component supports both image-grid mode (listings) and file-list mode (community)
- `useFileUploader` accepts `bucketName` and `pathPrefix` params

---

## Phase 2 — `community-post-schema`

**Goal:** Zod schemas and TypeScript types for creating and updating community posts.

### What to do

1. **Create `modules/community/types/index.ts`:**
   - Export types derived from `Database['public']['Tables']['community_posts']` (Row, Insert, Update).
   - Export `PostCategory = 'questions' | 'tips' | 'news' | 'troubleshooting'`.
   - Export `CommunityPostFormMode = 'create' | 'update'`.
   - Export attachment types derived from `community_posts_attachments`.

2. **Create `modules/community/schema.ts`:**
   - `createCommunityPostSchema(t)` — factory returning:
     - `title`: string, min 5, max 100
     - `content`: string, min 10, max 5000
     - `post_category`: enum (questions, tips, news, troubleshooting)
     - `attachments`: optional array of File objects (max 5 files, max 5MB each, accepted types: images + pdf)
   - `createUpdateCommunityPostSchema(t)` — same but attachments can include existing URLs
   - Infer and export `CreateCommunityPostFormData` and `UpdateCommunityPostFormData` types

### Spec Acceptance Criteria

- All schemas use factory pattern with `t` (translation function) like `modules/listings/schema.ts`
- Types are consistent with the Supabase DB schema
- Validation messages are translatable

---

## Phase 3 — `community-post-queries`

**Goal:** Supabase query functions and server actions for community post CRUD.

### What to do

1. **Create `modules/community/queries.ts`:**
   - `createCommunityPostQuery(data)` — inserts into `community_posts`, returns `post_id`. If attachments are provided, also inserts into `community_posts_attachments`.
   - `updateCommunityPostQuery(postId, data)` — updates `community_posts`. Handles attachment diffs (add new, remove deleted).
   - `getCommunityPostDetailsQuery(postId)` — fetches a single post with its attachments (for edit mode).

2. **Create `modules/community/actions.ts`:**
   - `createCommunityPostAction` — wraps `createCommunityPostQuery` with `errorHandler()`, revalidates `/community` path.
   - `updateCommunityPostAction` — wraps `updateCommunityPostQuery` with `errorHandler()`, revalidates `/community` and `/community/[postId]`.
   - `getCommunityPostDetailsAction` — wraps query with `errorHandler()`.

### Spec Acceptance Criteria

- All actions follow the `errorHandler()` wrapper pattern from listings
- Attachment URLs are stored in `community_posts_attachments` table (not inline in the post)
- `content_status` is set to `'published'` and `published_at` to `now()` when publishing
- Auth check: only the author can update their own post

---

## Phase 4 — `community-post-form-ui`

**Goal:** Build the form page — route, server component, client component, and form hook.

### Target Folder Structure

```
app/[locale]/(main)/community/
  create/
    page.tsx                          ← route
  [postId]/
    edit/
      page.tsx                        ← route (update mode)

modules/community/
  components/
    post-form/
      components/
        category-radio-field/
          CategoryRadioField.tsx      ← radio buttons for category
          index.ts
      hooks/
        usePostForm.ts                ← form logic hook
      types/
        index.ts
      PostForm.tsx                    ← server component (fetches data)
      PostFormClient.tsx              ← client component (renders form)
      index.ts
```

### What to do

1. **`PostForm.tsx`** (server component):
   - For update mode: fetch post details via `getCommunityPostDetailsAction(postId)`, pass as `initialData`.
   - Render `PostFormClient`.

2. **`PostFormClient.tsx`** (client component):
   - Use `FormProvider` from react-hook-form.
   - Fields: Title (`TextField`), Category (`CategoryRadioField`), Content (textarea — use `TextField` or a new `TextAreaField`), Attachments (`FileUpload` from Phase 1 with community config).
   - Single "Publish" button (no draft button in this version).
   - No sidebar — single-column centered layout.
   - Responsive, matches the project's existing card-based form styling.

3. **`usePostForm.ts`** hook:
   - Same pattern as `useListingForm.ts`.
   - Init `useForm` with `zodResolver(schema)`.
   - On submit: upload attachments via `useFileUploader`, then call `createCommunityPostAction` or `updateCommunityPostAction`.
   - On success: toast + redirect to `/community` (or to the post detail page).

4. **`CategoryRadioField.tsx`:**
   - Render 4 radio buttons (questions, tips, news, troubleshooting) styled per the HTML design (2×2 grid with icons).
   - Controlled via react-hook-form `Controller`.

5. **Route pages** (`create/page.tsx`, `[postId]/edit/page.tsx`):
   - Minimal: just render `<PostForm mode="create" />` or `<PostForm mode="update" postId={params.postId} />`.

### Spec Acceptance Criteria

- Form matches the design: title input, category radio grid, content textarea, attachments area, publish button
- No sidebar
- Fully translated (next-intl) — add keys to `en.json` and `ar.json`
- Accessible (labels, focus states, error messages)
- Loading/submitting states handled (spinner on button, disabled fields during submit)

---

## Phase 5 — `community-post-form-integration`

**Goal:** Wire everything end-to-end, handle edge cases, test the full flow.

### What to do

1. **Update mode flow:**
   - Ensure the edit page loads existing post data into the form (title, content, category pre-filled).
   - Existing attachments displayed with remove option.
   - On submit: diff attachments — upload new ones, delete removed ones from storage, update DB.

2. **Auth guard:**
   - Redirect unauthenticated users to login.
   - On edit page: verify the current user is the post author, otherwise redirect or show error.

3. **Navigation:**
   - Add "Create Post" link/button on the community page that routes to `/community/create`.
   - Add "Edit" button on post detail page (visible only to the author) that routes to `/community/[postId]/edit`.

4. **Translation keys:**
   - Add all new keys for form labels, validation messages, toasts, and page titles in both `en.json` and `ar.json`.

5. **Error handling:**
   - Form-level error display (same pattern as `ListingFormClient` with `submitError` alert).
   - File upload failure → cleanup uploaded files, show toast.
   - Network/server errors → user-friendly message via sonner toast.

6. **Smoke test the full flow:**
   - Create a post with title + category + content → verify it appears in DB with `content_status: 'published'`.
   - Create a post with attachments → verify `community_posts_attachments` rows + files in storage.
   - Edit a post → verify changes persist, attachment diffs applied correctly.

### Spec Acceptance Criteria

- Create flow works end-to-end (form → upload → DB → redirect)
- Update flow works end-to-end (load → edit → diff attachments → DB → redirect)
- Auth guards in place
- All strings translated (en + ar)
- Error states handled gracefully
- No regressions in listings upload functionality (Phase 1 refactor)

---

## Execution Order & Dependencies

```
Phase 1 (reusable-file-upload)
   ↓
Phase 2 (schema + types)          ← can run in parallel with Phase 1
   ↓
Phase 3 (queries + actions)       ← depends on Phase 2
   ↓
Phase 4 (form UI)                 ← depends on Phase 1 + 2 + 3
   ↓
Phase 5 (integration + polish)    ← depends on all above
```

**Phase 1 and Phase 2 can be done in parallel** since they don't depend on each other. Phase 3 needs Phase 2 types. Phase 4 needs everything. Phase 5 is the glue.

---

## Notes

- The `add_comment` function you mentioned is for comments on posts, not for creating posts themselves — it's out of scope for this plan.
- The design's sidebar, tags input, scheduling, and SEO fields are excluded per your instructions. Only: title, category, content, attachments, publish button.
- The community attachments bucket may need to be created in Supabase Storage if it doesn't exist yet. Make sure RLS policies are set up for the bucket.
