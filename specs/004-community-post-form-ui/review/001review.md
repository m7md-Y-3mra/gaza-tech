# Spec Review: 004-community-post-form-ui

- Branch: 004-community-post-form-ui
- Review file: 001review.md

## Summary

- Overall status: **FAIL** (3 blockers, 2 high, 2 medium issues)
- High-risk issues: TypeScript compilation fails (8 type errors in `usePostForm.ts`); route pages use synchronous params (breaks Next.js 16); no author ownership check in edit mode server component
- Missing tests / regression risk: No automated tests in project; manual smoke testing only
- Test suite results: N/A (no test framework)
- Lint results: 0 errors, 8 warnings (all pre-existing, none from this feature)
- Type check results: **8 errors** — all in `modules/community/components/post-form/hooks/usePostForm.ts`

## Task-by-task Verification

### Task T001: Create TextAreaField shared component

- Spec requirement: FR-003 (plain-text textarea with form integration)
- Implementation found:
  - Files: `components/text-area-field/TextAreaField.tsx`
  - Key symbols: `TextAreaField`, uses `Textarea` from `components/ui/textarea`, `useFormContext`, `register`, label, error display, character count
- Status: **PASS**
- Evidence: Component renders `<Textarea>` with label, aria-invalid, error message via `AlertCircle`, and character count display (`currentLength / maxLength`).

### Task T002: Create barrel export for TextAreaField

- Spec requirement: Module structure
- Implementation found: `components/text-area-field/index.ts`
- Status: **PASS**
- Evidence: `export { default } from './TextAreaField';`

### Task T003: Create post form types

- Spec requirement: Data model types (PostFormInitialData, PostFormClientProps, PostFormProps)
- Implementation found: `modules/community/components/post-form/types/index.ts`
- Status: **PASS**
- Evidence: All three types defined. `PostFormClientProps` is a discriminated union by `mode`. `PostFormInitialData` includes `attachments: FileUploadItem[]`.

### Task T004: Create default values helper and config constant

- Spec requirement: Form initialization, file upload config per data-model.md
- Implementation found: `modules/community/components/post-form/constant.ts`
- Status: **PASS**
- Evidence: `communityFileUploadConfig` matches spec (bucket: `community-attachments`, pathPrefix: `community/`, maxFiles: 5, displayMode: `file-list`, enableCompression: false). `getDefaultValues` returns correct defaults for create (empty) and update (from initialData).

### Task T005: Create CategoryRadioField component

- Spec requirement: FR-004 (2×2 radio grid, 4 categories, icons, keyboard accessible)
- Implementation found: `modules/community/components/post-form/components/category-radio-field/CategoryRadioField.tsx`
- Status: **PASS**
- Evidence: Uses `Controller`, renders `grid grid-cols-1 gap-4 sm:grid-cols-2` (responsive: 1-col mobile, 2-col desktop). Icons: HelpCircle, Lightbulb, Newspaper, Wrench. `role="radiogroup"`, `sr-only` input, `focus-within:ring` for keyboard. Error display with `AlertCircle`.

### Task T006: Create barrel export for CategoryRadioField

- Implementation found: `modules/community/components/post-form/components/category-radio-field/index.ts`
- Status: **PASS**

### Task T007: Create PostFormSkeleton

- Implementation found: `modules/community/components/post-form/PostFormSkeleton.tsx`
- Status: **PASS**
- Evidence: Uses `Skeleton` from shadcn/ui. Matches form layout: title, category grid (4 cards), content, file upload, action button.

### Task T008: Create PostFormError

- Spec requirement: Error fallback matching ListingFormError pattern, FR-014 (translatable)
- Implementation found: `modules/community/components/post-form/PostFormError.tsx`
- Status: **PARTIAL**
- Evidence: Component exists with proper error display, but has **hardcoded English strings**: "Unable to Load Post Form", "We encountered an issue...", "Error Details:", "Try Again", "Go Back". Violates FR-014 (all strings translatable).
- Problems: Hardcoded English strings in error fallback. Note: `ListingFormError` in listings also has hardcoded strings, so this follows the existing pattern — but the spec explicitly requires FR-014 compliance.

### Task T009: Create barrel export for post-form

- Implementation found: `modules/community/components/post-form/index.ts`
- Status: **PASS**
- Evidence: Exports `PostForm`, `PostFormClient`, `PostFormSkeleton`, `PostFormError`.

### Task T010: Create PostFormClient

- Spec requirement: FR-003, FR-007, FR-010 (single-column, all fields, loading/disabled states)
- Implementation found: `modules/community/components/post-form/PostFormClient.tsx`
- Status: **PASS**
- Evidence: Single-column `max-w-3xl mx-auto`. Fields: TextField (title), CategoryRadioField (category), TextAreaField (content), FileUpload (attachments). Submit error alert. Loader2 spinner. All fields disabled during `isLoading`. Create/update button text. Cancel button.

### Task T011: Create usePostForm hook

- Spec requirement: FR-008, FR-011 (create flow, error handling, cleanup)
- Implementation found: `modules/community/components/post-form/hooks/usePostForm.ts`
- Status: **FAIL**
- Evidence: Logic is correct but **8 TypeScript compilation errors**. The hook treats `attachments` as `FileUploadItem[]` (with `.file`, `.isExisting`, `.preview` properties) but the zod schema types infer `attachments` as `(File | string)[]`. The `filter()` and `map()` calls use `FileUploadItem`/`NewFileUploadItem`/`ExistingFileUploadItem` type guards on `(File | string)[]` arrays, causing type mismatches. Also `form.handleSubmit(onSubmit)` fails because `PostFormData` doesn't match `SubmitHandler<TFieldValues>`.
- Root cause: The client schemas (`createCreateCommunityPostClientSchema`, `createUpdateCommunityPostClientSchema`) define `attachments` as `z.array(File)` and `z.array(File | string.url())` respectively. The hook expects `FileUploadItem[]` which has `id`, `preview`, `isThumbnail`, `isExisting` properties. These types are incompatible. The `FileUpload` component manages its own internal state via `useFileUpload` hook and syncs with react-hook-form, but the form's zod schema expects raw `File` objects, not `FileUploadItem` objects.

### Task T012: Create PostForm server component (create mode)

- Implementation found: `modules/community/components/post-form/PostForm.tsx`
- Status: **PASS** (for create mode specifically)
- Evidence: `if (mode === 'create') return <PostFormClient mode="create" />`

### Task T013: Create CreatePostPage module page

- Implementation found: `modules/community/create-post/CreatePostPage.tsx`
- Status: **PASS**
- Evidence: `ErrorBoundary` + `Suspense` + `PostForm mode="create"`, matching `CreateListingPage` pattern.

### Task T014: Create barrel export for create-post

- Implementation found: `modules/community/create-post/index.ts`
- Status: **PASS**

### Task T015: Create route page for create post

- Spec requirement: FR-001, CLAUDE.md async params rule
- Implementation found: `app/[locale]/(main)/community/create/page.tsx`
- Status: **FAIL**
- Evidence: `generateMetadata` uses synchronous destructuring: `params: { locale: string }` instead of `params: Promise<{ locale: string }>` with `await params`. Next.js 16 requires async params. The existing listings create page (`app/[locale]/(main)/listings/create/page.tsx`) doesn't destructure params at all in `generateMetadata` — it uses `getLocale()` instead. This page should follow that pattern.

### Task T016: Add English translation keys

- Implementation found: `messages/en.json` lines 662–721
- Status: **PARTIAL**
- Evidence: PostForm namespace complete (fields, placeholders, buttons, categories, toast, validation). Metadata.createPost and Metadata.editPost present. However, the content placeholder says "You can use markdown" which contradicts the spec clarification (plain text only, no formatting).

### Task T017: Add Arabic translation keys

- Implementation found: `messages/ar.json` lines 662–721
- Status: **PASS**
- Evidence: All keys present with Arabic translations. Arabic content placeholder does not mention markdown.

### Task T018: Extend PostForm server component with update mode + author check

- Spec requirement: FR-012 (pre-fill), US2 scenario 3 (author guard)
- Implementation found: `modules/community/components/post-form/PostForm.tsx`
- Status: **PARTIAL**
- Evidence: Update mode fetches post via `getCommunityPostDetailsAction(postId)`, maps data to `PostFormInitialData` including attachments. Uses `notFound()` if post not found. **However, there is NO author ownership verification** — any authenticated user can load the edit form for any post. The task description explicitly requires: "verify current user is the post author (throw error if not)."

### Task T019: Extend usePostForm with update mode

- Implementation found: `modules/community/components/post-form/hooks/usePostForm.ts`
- Status: **FAIL** (same type errors as T011)
- Evidence: Update logic exists (schema selection, `updateCommunityPostAction` call, default values from initialData) but TypeScript errors prevent compilation.

### Task T020: Update PostFormClient for update mode

- Implementation found: `modules/community/components/post-form/PostFormClient.tsx`
- Status: **PASS**
- Evidence: `isUpdate` flag controls button text (publish/update), page title/description, and FileUpload mode.

### Task T021: Create UpdatePostPage module page

- Implementation found: `modules/community/update-post/UpdatePostPage.tsx`
- Status: **PASS**

### Task T022: Create barrel export for update-post

- Implementation found: `modules/community/update-post/index.ts`
- Status: **PASS**

### Task T023: Create route page for edit post

- Spec requirement: FR-002, CLAUDE.md async params rule
- Implementation found: `app/[locale]/(main)/community/[postId]/edit/page.tsx`
- Status: **FAIL**
- Evidence: Both `generateMetadata` and `Page` use synchronous destructuring: `params: { locale: string }` and `params: { postId: string }`. Next.js 16 requires `params: Promise<{...}>` with `await params`. Compare with the existing listings edit page which uses `params: Promise<{ id: string }>`.

### Task T024: Add English translation keys for edit mode

- Implementation found: `messages/en.json`
- Status: **PASS**
- Evidence: `buttons.update`, `buttons.updating`, `toast.updateSuccess`, `toast.updateError`, `Metadata.editPost` all present.

### Task T025: Add Arabic translation keys for edit mode

- Implementation found: `messages/ar.json`
- Status: **PASS**

### Task T026: Add FileUpload to PostFormClient

- Implementation found: `modules/community/components/post-form/PostFormClient.tsx` lines 72–91
- Status: **PASS**
- Evidence: `FileUpload` rendered with `communityFileUploadConfig`, create mode gets `mode="create"`, update mode gets `mode="update"` with `initialFiles`.

### Task T027: Extend usePostForm with attachment upload (create)

- Implementation found: `modules/community/components/post-form/hooks/usePostForm.ts` lines 74–101
- Status: **FAIL** (type errors as T011)
- Evidence: Logic is present (upload files, get URLs, pass to action, cleanup on failure) but TypeScript types are incompatible.

### Task T028: Extend usePostForm with attachment diff (update)

- Implementation found: `modules/community/components/post-form/hooks/usePostForm.ts` lines 103–171
- Status: **FAIL** (type errors as T011)
- Evidence: Logic exists (filter existing/new, diff URLs, delete removed, upload new, combine for action) but TypeScript types are incompatible.

### Task T029: Update PostForm server component to map attachments

- Implementation found: `modules/community/components/post-form/PostForm.tsx` lines 25–32
- Status: **PASS**
- Evidence: Maps `community_posts_attachments` to `FileUploadItem[]`: `{ id: att.attachment_id, preview: att.file_url, isThumbnail: false, isExisting: true }`.

### Task T030: Verify inline validation errors

- Status: **PASS** (conditional on type errors being fixed)
- Evidence: `mode: 'onBlur'` set on useForm. TextField, TextAreaField, CategoryRadioField all display errors via `get(errors, name)` + `hasError` pattern. Translated validation messages via schema factory.

### Task T031: Verify submit error alert display

- Status: **PASS** (conditional on type errors being fixed)
- Evidence: `submitError` state displayed in red alert with `AlertCircle`. Cleanup logic in catch block deletes uploaded files.

### Task T032: Verify loading/disabled states

- Status: **PASS**
- Evidence: `isLoading = isSubmitting || isPending`. `Loader2` spinner on button. Button text changes (`publishing`/`updating`). All fields pass `disabled={isLoading}`.

### Task T033: Verify keyboard accessibility

- Status: **PASS**
- Evidence: TextField uses `<input>` (native focus). TextAreaField uses `<textarea>` (native focus). CategoryRadioField uses `<input type="radio">` with `focus-within:ring` on labels. FileUpload has native file input. Publish button is `<button type="submit">`. Tab order follows DOM order.

### Task T034: Verify RTL layout

- Status: **PASS**
- Evidence: Arabic translations complete. Layout uses Tailwind logical properties where needed (`start`, `end`). No hardcoded `left`/`right` in new components.

### Task T035: Run npm run check

- Status: **FAIL**
- Evidence: `npm run type-check` produces 8 errors in `usePostForm.ts`. `npm run lint` produces 0 new errors.

### Task T036: Manual smoke test

- Status: **UNKNOWN** — cannot run due to type errors blocking build.

## Issues List (Consolidated)

IMPORTANT: Issues ordered by fix dependency (fix A before B if B depends on A).

### Issue 1: TypeScript type mismatch in usePostForm.ts — attachments typed as (File | string)[] vs FileUploadItem[]

- [ ] FIXED
- Severity: **BLOCKER**
- Depends on: none
- Affected tasks: T011, T019, T027, T028, T035
- Evidence (paths/symbols): `modules/community/components/post-form/hooks/usePostForm.ts` — 8 type errors at lines 80, 108, 113, 117, 138, 148, 197
- Root cause analysis: The zod client schemas (`createCreateCommunityPostClientSchema`, `createUpdateCommunityPostClientSchema`) define `attachments` as `z.array(File)` (create) and `z.array(z.union([File, z.string().url()]))` (update). The inferred TypeScript type is `File[]` and `(File | string)[]`. However, the `usePostForm` hook treats `attachments` as `FileUploadItem[]` (which has `id`, `preview`, `isThumbnail`, `isExisting` properties). The `FileUpload` component manages its own state using `FileUploadItem` and syncs with react-hook-form via its `useFileUpload` hook — but what it writes to the form field depends on the `fileReducer` implementation. The hook's `filter` calls use type guards like `(att: FileUploadItem): att is ExistingFileUploadItem` on arrays typed as `(File | string)[]`, causing type incompatibility. Also, `form.handleSubmit(onSubmit)` fails because the generic `PostFormData` union doesn't satisfy `SubmitHandler<TFieldValues>`.
- Proposed solution (detailed steps):
  1. The core issue is that `usePostForm` needs to work with the form data as returned by react-hook-form (which matches the zod schema output types: `File[]` or `(File|string)[]`), NOT with `FileUploadItem[]`. The `FileUpload` component uses its own internal state for display but writes raw `File` objects back to the form field.
  2. In `modules/community/components/post-form/hooks/usePostForm.ts`:
     - Remove imports for `FileUploadItem`, `NewFileUploadItem`, `ExistingFileUploadItem`
     - For **create mode** (line ~78-84): `attachments` is `File[] | undefined`. Change the upload call to: `attachments.map((file: File) => ({ file }))` — no need to access `.file` on the item since each item IS a File.
     - For **update mode** (lines ~107-153): `attachments` is `(File | string)[] | undefined`. Existing attachments are strings (URLs), new ones are File objects. Replace `FileUploadItem` type guards with simpler checks:
       - `existingAttachments = attachments.filter((att): att is string => typeof att === 'string')`
       - `newAttachments = attachments.filter((att): att is File => att instanceof File)`
       - Replace `att.preview` with `att` (since existing attachments are URL strings)
       - Replace `att.file` with `att` (since new attachments ARE File objects)
     - For the `form.handleSubmit(onSubmit)` error at line 197: Type the form explicitly. Change `useForm<PostFormData>` to use a concrete type. The simplest fix: cast `onSubmit` in the return: `onSubmit: form.handleSubmit(onSubmit as Parameters<typeof form.handleSubmit>[0])`
  3. Update `initialAttachmentUrls` (line 60-65): Change `initialData.attachments.map((att) => att.preview)` — this references `FileUploadItem.preview`. The initial attachment URLs should come from `PostFormInitialData`. Since `PostFormInitialData.attachments` is `FileUploadItem[]`, accessing `.preview` is correct at the type level. However, the default values function passes these into the form where the schema expects `(File | string)[]`. The `getDefaultValues` in `constant.ts` needs to map `FileUploadItem[]` to `string[]` (the URLs) for the update form default values.
  4. In `modules/community/components/post-form/constant.ts`: Update `getDefaultValues` for the `initialData` case — map `initialData.attachments` to URL strings: `attachments: initialData.attachments.map((att) => att.preview)` so the form field value matches the zod schema's expected `(File | string)[]` type.
- Test plan: Run `npm run type-check` — should produce 0 errors in `usePostForm.ts`. Run `npm run lint` — should have no new errors.
- Notes: The `FileUpload` component's internal `useFileUpload` hook manages `FileUploadItem[]` state internally but writes appropriate values to react-hook-form. Need to verify what `useFileUpload` actually writes to the form field — if it writes `FileUploadItem` objects rather than `File`/`string`, then the zod schemas need updating instead.

### Issue 2: Route pages use synchronous params (Next.js 16 requires async)

- [ ] FIXED
- Severity: **BLOCKER**
- Depends on: none
- Affected tasks: T015, T023
- Evidence (paths/symbols):
  - `app/[locale]/(main)/community/create/page.tsx` lines 4-8: `params: { locale: string }` — synchronous
  - `app/[locale]/(main)/community/[postId]/edit/page.tsx` lines 4-8 and 17-20: `params: { locale: string }` and `params: { postId: string }` — synchronous
- Root cause analysis: Next.js 16 requires `params` to be a `Promise`. CLAUDE.md explicitly states: "Locale Params: All pages under [locale] receive async params: `params: Promise<{ locale: string }>`". The existing listings create page uses `getLocale()` instead of destructuring params in `generateMetadata`.
- Proposed solution (detailed steps):
  1. **`app/[locale]/(main)/community/create/page.tsx`**: In `generateMetadata`, replace synchronous `params: { locale: string }` with either:
     - Use `getLocale()` from `next-intl/server` (matching the listings create page pattern): `const locale = await getLocale();`
     - Or use async params: `params: Promise<{ locale: string }>` then `const { locale } = await params;`
  2. **`app/[locale]/(main)/community/[postId]/edit/page.tsx`**:
     - In `generateMetadata`: change to `{ params }: { params: Promise<{ locale: string; postId: string }> }` then `const { locale } = await params;`
     - In `Page`: change to `{ params }: { params: Promise<{ postId: string }> }` then `const { postId } = await params;`
     - Match the pattern from `app/[locale]/(main)/listings/[id]/edit/page.tsx` which uses `params: Promise<{ id: string }>`.
- Test plan: Run `npm run type-check` — no new errors. Run `npm run build` to verify SSR doesn't break.

### Issue 3: PostForm server component missing author ownership check in update mode

- [ ] FIXED
- Severity: **HIGH**
- Depends on: none
- Affected tasks: T018
- Evidence (paths/symbols): `modules/community/components/post-form/PostForm.tsx` — update mode fetches post but never checks if the current user is the author before rendering the edit form.
- Root cause analysis: Task T018 explicitly requires "verify current user is the post author (throw error if not)". The server-side `updateCommunityPostQuery` checks `author_id` on write, but the form still loads and renders for non-authors — they'll only see an error after filling out and submitting. The guard should be at the server component level to prevent the form from rendering at all.
- Proposed solution (detailed steps):
  1. In `modules/community/components/post-form/PostForm.tsx`:
     - Import `createClient` from `@/lib/supabase/server` and `authHandler` from `@/utils/auth-handler`
     - After fetching the post (`response.data`), get the current user: `const user = await authHandler();`
     - Compare `post.author_id !== user.id` — if mismatched, throw an Error: `throw new Error('You are not authorized to edit this post');`
     - This error will be caught by the ErrorBoundary and displayed via PostFormError.
- Test plan: Log in as user A, create a post, copy the postId. Log in as user B, navigate to `/community/{postId}/edit` — should see error page, not the form.

### Issue 4: English content placeholder mentions markdown (contradicts spec)

- [ ] FIXED
- Severity: **MED**
- Depends on: none
- Affected tasks: T016
- Evidence (paths/symbols): `messages/en.json` line 676: `"content": "Write your post content here... You can use markdown."` — spec clarification says "Plain text only (standard textarea, no formatting)."
- Root cause analysis: The placeholder was written before or without considering the spec clarification from session 2026-04-02 which confirmed plain text only.
- Proposed solution:
  1. In `messages/en.json`: Change line 676 from `"content": "Write your post content here... You can use markdown."` to `"content": "Write your post content here..."`
- Test plan: Visual check — placeholder should not mention markdown.

### Issue 5: PostFormError has hardcoded English strings (FR-014 violation)

- [ ] FIXED
- Severity: **MED**
- Depends on: none
- Affected tasks: T008
- Evidence (paths/symbols): `modules/community/components/post-form/PostFormError.tsx` — hardcoded: "Unable to Load Post Form", "We encountered an issue while loading the post form...", "Error Details:", "Try Again", "Go Back"
- Root cause analysis: The component is a client-side error boundary fallback. FR-014 requires all strings translatable. However, `ListingFormError` in the listings module also has hardcoded English strings. This is an existing pattern issue. Since `PostFormError` is a `'use client'` component, it CAN use `useTranslations`.
- Proposed solution:
  1. In `PostFormError.tsx`: Add `import { useTranslations } from 'next-intl';` and call `const t = useTranslations('PostForm.error');` inside the component.
  2. Replace hardcoded strings with `t('title')`, `t('description')`, `t('errorDetails')`, `t('tryAgain')`, `t('goBack')`.
  3. In `messages/en.json` under `PostForm`, add:
     ```json
     "error": {
       "title": "Unable to Load Post Form",
       "description": "We encountered an issue while loading the post form. This could be due to a network problem or server issue.",
       "errorDetails": "Error Details:",
       "tryAgain": "Try Again",
       "goBack": "Go Back"
     }
     ```
  4. In `messages/ar.json` under `PostForm`, add:
     ```json
     "error": {
       "title": "تعذر تحميل نموذج المنشور",
       "description": "واجهنا مشكلة أثناء تحميل نموذج المنشور. قد يكون السبب مشكلة في الشبكة أو الخادم.",
       "errorDetails": "تفاصيل الخطأ:",
       "tryAgain": "حاول مرة أخرى",
       "goBack": "العودة"
     }
     ```
- Test plan: Trigger error boundary by navigating to `/community/nonexistent-id/edit` — error page should display. Switch to Arabic locale — should show Arabic strings.
- Notes: This follows the same pattern as the existing `ListingFormError` issue but fixes it for community. Consider fixing `ListingFormError` separately.

## Fix Plan (Ordered)

1. Issue 1: TypeScript type mismatch in usePostForm.ts — Fix attachment type handling to match zod schema output types (`File[]` and `(File|string)[]` instead of `FileUploadItem[]`); fix `form.handleSubmit` typing; update `getDefaultValues` to map attachments to URL strings
2. Issue 2: Route pages sync params — Convert both route pages to use async `params: Promise<{...}>` with `await params` per Next.js 16 requirement
3. Issue 3: Missing author ownership check — Add `authHandler()` + `author_id` comparison in PostForm.tsx update mode before rendering form
4. Issue 4: Markdown placeholder — Remove markdown mention from English content placeholder
5. Issue 5: Hardcoded English in PostFormError — Add `useTranslations` and translation keys for error fallback strings

## Handoff to Coding Model (Copy/Paste)

- **Files to edit**:
  1. `modules/community/components/post-form/hooks/usePostForm.ts` — Fix all type errors (Issue 1)
  2. `modules/community/components/post-form/constant.ts` — Map attachments to URLs in getDefaultValues (Issue 1)
  3. `app/[locale]/(main)/community/create/page.tsx` — Async params (Issue 2)
  4. `app/[locale]/(main)/community/[postId]/edit/page.tsx` — Async params (Issue 2)
  5. `modules/community/components/post-form/PostForm.tsx` — Author check (Issue 3)
  6. `messages/en.json` — Fix placeholder, add error keys (Issues 4, 5)
  7. `messages/ar.json` — Add error keys (Issue 5)
  8. `modules/community/components/post-form/PostFormError.tsx` — Use translations (Issue 5)

- **Exact behavior changes**:
  - Type-check must pass with 0 errors
  - Route pages must use async params
  - Non-authors cannot see edit form (get error page)
  - Content placeholder must not mention markdown
  - Error fallback must display in user's locale

- **Edge cases**:
  - Issue 1: Verify what `FileUpload`'s `useFileUpload` hook writes to react-hook-form — may be `File` objects or `FileUploadItem` objects. Read `components/file-upload/hooks/useFileUpload.ts` to confirm before fixing.
  - Issue 3: `authHandler()` may throw if unauthenticated — this is caught by ErrorBoundary, which is acceptable.

- **Suggested commit breakdown**:
  1. `fix(community): resolve TypeScript type errors in usePostForm hook`
  2. `fix(community): use async params in route pages for Next.js 16 compatibility`
  3. `feat(community): add author ownership check in edit mode server component`
  4. `fix(community): remove markdown mention from content placeholder`
  5. `fix(community): translate PostFormError hardcoded strings`

End of report.
