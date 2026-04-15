# Tasks: Community Post Form UI

**Input**: Design documents from `/specs/004-community-post-form-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared components and type foundations needed by all user stories

- [x] T001 [P] Create `TextAreaField` shared component with react-hook-form integration, label, error display, and character count in `components/text-area-field/TextAreaField.tsx`
- [x] T002 [P] Create barrel export in `components/text-area-field/index.ts`
- [x] T003 [P] Create post form types (`PostFormInitialData`, `PostFormClientProps`, `PostFormProps`) in `modules/community/components/post-form/types/index.ts`
- [x] T004 [P] Create default values helper (`getDefaultValues`) and community file upload config constant in `modules/community/components/post-form/constant.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core form structure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `CategoryRadioField` component — 2×2 card grid on desktop, 1×4 stacked on mobile (<640px), with lucide-react icons (HelpCircle, Lightbulb, Newspaper, Wrench), react-hook-form `Controller`, error display, keyboard accessible in `modules/community/components/post-form/components/category-radio-field/CategoryRadioField.tsx`
- [x] T006 [P] Create barrel export in `modules/community/components/post-form/components/category-radio-field/index.ts`
- [x] T007 Create `PostFormSkeleton` loading placeholder (single-column layout matching form structure) in `modules/community/components/post-form/PostFormSkeleton.tsx`
- [x] T008 [P] Create `PostFormError` error fallback component (matching `ListingFormError` pattern) in `modules/community/components/post-form/PostFormError.tsx`
- [x] T009 Create barrel export for post-form component in `modules/community/components/post-form/index.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Create a New Community Post (Priority: P1) 🎯 MVP

**Goal**: An authenticated user can navigate to the create post page, fill in title/category/content, and publish a post

**Independent Test**: Navigate to `/community/create`, fill all fields, click Publish → post created, toast shown, redirected to `/community`

### Implementation for User Story 1

- [x] T010 [US1] Create `PostFormClient` client component shell — single-column centered layout with `FormProvider`, Title (`TextField`), Category (`CategoryRadioField`), Content (`TextAreaField`), Publish button, submit error alert, loading/disabled states in `modules/community/components/post-form/PostFormClient.tsx`
- [x] T011 [US1] Create `usePostForm` hook — init `useForm` with `zodResolver` + create schema factory, `onSubmit` handler calling `createCommunityPostAction`, success toast + redirect to `/community`, error handling with `submitError` state, loading state in `modules/community/components/post-form/hooks/usePostForm.ts`
- [x] T012 [US1] Create `PostForm` server component (create mode only) — renders `PostFormClient` with `mode="create"` in `modules/community/components/post-form/PostForm.tsx`
- [x] T013 [US1] Create `CreatePostPage` module page — `ErrorBoundary` + `Suspense` + `PostForm` (following `CreateListingPage` pattern) in `modules/community/create-post/CreatePostPage.tsx`
- [x] T014 [P] [US1] Create barrel export in `modules/community/create-post/index.ts`
- [x] T015 [US1] Create route page with `generateMetadata` for create post in `app/[locale]/(main)/community/create/page.tsx`
- [x] T016 [US1] Add English translation keys for `PostForm` namespace (labels, placeholders, buttons, validation, toasts) and `Metadata.createPost` in `messages/en.json`
- [x] T017 [US1] Add Arabic translation keys for `PostForm` namespace and `Metadata.createPost` in `messages/ar.json`

**Checkpoint**: Create post flow fully functional — navigate to `/community/create`, fill form, publish, redirect

---

## Phase 4: User Story 2 — Edit an Existing Community Post (Priority: P2)

**Goal**: A post author can navigate to the edit page, see pre-filled form with existing data, update fields, and save

**Independent Test**: Create a post, navigate to `/community/[postId]/edit`, change the title, click Update → changes persist

### Implementation for User Story 2

- [x] T018 [US2] Extend `PostForm` server component with update mode — fetch post via `getCommunityPostDetailsAction(postId)`, verify current user is the post author (throw error if not), map to `PostFormInitialData`, pass to `PostFormClient` in `modules/community/components/post-form/PostForm.tsx`
- [x] T019 [US2] Extend `usePostForm` hook with update mode — use `createUpdateCommunityPostClientSchema`, call `updateCommunityPostAction`, pre-fill default values from `initialData` in `modules/community/components/post-form/hooks/usePostForm.ts`
- [x] T020 [US2] Update `PostFormClient` to handle update mode — change button text to "Update", pass mode-dependent props in `modules/community/components/post-form/PostFormClient.tsx`
- [x] T021 [US2] Create `UpdatePostPage` module page — `ErrorBoundary` + `Suspense` + `PostForm mode="update"` with postId prop in `modules/community/update-post/UpdatePostPage.tsx`
- [x] T022 [P] [US2] Create barrel export in `modules/community/update-post/index.ts`
- [x] T023 [US2] Create route page with `generateMetadata` for edit post in `app/[locale]/(main)/community/[postId]/edit/page.tsx`
- [x] T024 [US2] Add English translation keys for edit mode (buttons.update, buttons.updating, toast.updateSuccess, toast.updateError, Metadata.editPost) in `messages/en.json`
- [x] T025 [US2] Add Arabic translation keys for edit mode in `messages/ar.json`

**Checkpoint**: Edit post flow fully functional — load existing data, modify, save, redirect

---

## Phase 5: User Story 3 — Attach Files to a Community Post (Priority: P3)

**Goal**: Users can optionally add/remove file attachments (images, PDFs) when creating or editing a post

**Independent Test**: Create a post with 2 attachments → verify in DB; edit post, remove one, add new one → verify diff applied

### Implementation for User Story 3

- [x] T026 [US3] Add `FileUpload` component (file-list mode, community config) to `PostFormClient` with create/update mode support in `modules/community/components/post-form/PostFormClient.tsx`
- [x] T027 [US3] Extend `usePostForm` hook with attachment handling — `useFileUploader` for upload, create mode: upload files then pass URLs to action, cleanup on failure in `modules/community/components/post-form/hooks/usePostForm.ts`
- [x] T028 [US3] Extend `usePostForm` hook with update mode attachment diff — track initial attachment URLs, diff existing vs new, upload new files, delete removed files from storage, pass combined list to update action in `modules/community/components/post-form/hooks/usePostForm.ts`
- [x] T029 [US3] Update `PostForm` server component to map existing `community_posts_attachments` to `FileUploadItem[]` format for initialData in `modules/community/components/post-form/PostForm.tsx`

**Checkpoint**: Attachments work in both create and edit flows — upload, display, remove, diff

---

## Phase 6: User Story 4 — Form Validation and Error Feedback (Priority: P2)

**Goal**: Users see clear, localized validation errors inline, a prominent error banner on server errors, and loading/disabled state during submission

**Independent Test**: Submit with invalid data → inline errors appear; trigger server error → error alert shown; submit valid data → loading spinner, disabled fields

### Implementation for User Story 4

- [x] T030 [US4] Verify and refine inline validation error display on all fields (title, content, category, attachments) — ensure `onBlur` mode triggers errors, error messages use translated strings in `modules/community/components/post-form/PostFormClient.tsx`
- [x] T031 [US4] Verify submit error alert display — `AlertCircle` icon + error message banner matching listing form pattern, ensure uploaded files cleaned up on failure in `modules/community/components/post-form/PostFormClient.tsx`
- [x] T032 [US4] Verify loading/disabled states — button spinner (`LoadingSubmittingSpinner`), button text changes (Publishing.../Updating.../Redirecting...), all fields disabled during submit in `modules/community/components/post-form/PostFormClient.tsx`

**Checkpoint**: All validation, error, and loading states work correctly with translated messages

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, i18n completeness, code quality

- [x] T033 [P] Verify keyboard accessibility — tab through all fields (title → category radios → content → file upload → publish button), visible focus states, Enter/Space activates radios
- [x] T034 [P] Verify RTL layout — form renders correctly in Arabic locale, all labels/errors/buttons display in Arabic
- [x] T035 Run `npm run check` (format + lint + type-check) and fix any issues
- [x] T036 Manual smoke test per quickstart.md checklist (9 scenarios)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — core create flow
- **US2 (Phase 4)**: Depends on US1 — extends form with update mode
- **US3 (Phase 5)**: Depends on US1 — adds attachment handling to existing form
- **US4 (Phase 6)**: Depends on US1 — refinement of validation/error/loading states
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational only — MVP, can be tested standalone
- **User Story 2 (P2)**: Depends on US1 — extends the form with update mode, shares the same components
- **User Story 3 (P3)**: Depends on US1 — adds FileUpload to existing form; US2 integration (attachment diff) can follow
- **User Story 4 (P2)**: Depends on US1 — refinement pass over existing form states

### Within Each User Story

- UI components/shell before logic hooks
- Logic hooks before integration (route pages)
- Translation keys after component implementation (know exact keys needed)
- Each task should produce a committable increment

### Parallel Opportunities

- T001, T002, T003, T004 (Phase 1) — all different files, can run in parallel
- T007, T008 (Phase 2) — skeleton and error fallback are independent files
- T014 (barrel export) parallel with other US1 tasks
- T022 (barrel export) parallel with other US2 tasks
- T033, T034 (Phase 7) — accessibility and RTL checks are independent

---

## Parallel Example: Phase 1 Setup

```
# Launch all setup tasks together:
Task: T001 "Create TextAreaField in components/text-area-field/TextAreaField.tsx"
Task: T002 "Create barrel export in components/text-area-field/index.ts"
Task: T003 "Create post form types in modules/community/components/post-form/types/index.ts"
Task: T004 "Create constants in modules/community/components/post-form/constant.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (shared components, types)
2. Complete Phase 2: Foundational (form structure, sub-components)
3. Complete Phase 3: User Story 1 (create flow end-to-end)
4. **STOP and VALIDATE**: Test create flow independently at `/community/create`
5. Deploy/demo if ready — users can create posts

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Create) → Test → Deploy (MVP!)
3. Add US2 (Edit) → Test → Deploy (authors can edit)
4. Add US3 (Attachments) → Test → Deploy (rich posts with files)
5. Add US4 (Validation polish) → Test → Deploy (polished error handling)
6. Polish → Final validation → Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US4 tasks are refinement/verification — most validation is built into US1 via react-hook-form + zod
- US3 depends on US1 for create mode attachments; US2 integration (attachment diff in edit mode) is T028/T029
- Commit after each task following Conventional Commits format
- Stop at any checkpoint to validate story independently
