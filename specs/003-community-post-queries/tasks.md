# Tasks: Community Post Queries & Server Actions

**Input**: Design documents from `/specs/003-community-post-queries/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No test tasks included (not requested in spec).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Server-side validation schemas needed by all query functions

- [x] T001 Create server-side Zod schemas for create and update in `modules/community/server-schema.ts` — create schema requires `title` (string min 5 max 100), `content` (string min 10 max 5000), `post_category` (enum from `POST_CATEGORIES`), optional `attachments` array of `{ url: string }` (max 5); update schema is partial with `attachments` items including optional `isExisting` boolean. Follow `modules/listings/schema.ts` server schema pattern (lines 163-191). Use `zodValidation` from `lib/zod-error.ts` for runtime validation. No `author_id` in schema — injected from `authHandler()`.

**Checkpoint**: Server schemas compile and `npm run check` passes

---

## Phase 2: User Story 1 - Create a Community Post (Priority: P1) 🎯 MVP

**Goal**: An authenticated user can create a new community post with optional attachments, persisted to the database with `content_status = 'published'`.

**Independent Test**: Submit a valid post payload via the create action and verify the post row and attachment rows appear in the database with correct values.

### Implementation for User Story 1

- [x] T002 [US1] Implement `createCommunityPostQuery(data)` in `modules/community/queries.ts` — add `'use server'` and `import 'server-only'` at top. Authenticate with `authHandler()`. Validate input with `zodValidation(createCommunityPostServerSchema, data)` (validate `data` only — do NOT include `author_id` in the validation call, as the schema does not declare it and Zod strips unknown keys). After validation, build the insert payload by spreading validated data and adding `author_id: user.id` separately: `{ ...validatedData, author_id: user.id, content_status: 'published', published_at: new Date().toISOString() }`. Chain `.select('post_id').single()` on the insert and return `{ postId: insertedRow.post_id }` (camelCase, matching the `{ listingId }` convention in `createListingQuery`). Follow `createListingQuery` pattern in `modules/listings/queries.ts` (see the `createListingQuery` function for the auth → validate → insert → return id structure).
- [x] T003 [US1] Implement attachment insertion in `modules/community/queries.ts` — add private `insertCommunityPostAttachmentsQuery(client, postId, attachments)` helper. Map attachment URLs to `{ post_id, file_url }` records and bulk insert into `community_posts_attachments`. Call from `createCommunityPostQuery` after post insert. On attachment failure, rollback by deleting the created post (same pattern as `modules/listings/queries.ts:419-430`).
- [x] T004 [US1] Implement `createCommunityPostAction` in `modules/community/actions.ts` — add `'use server'` at top. Import and wrap `createCommunityPostQuery` with `errorHandler()`. After successful creation, call `revalidatePath('/community')`. Follow `createListingAction` pattern in `modules/listings/actions.ts:89-99`.

**Checkpoint**: Create action returns `{ success: true, data: { postId } }` for valid input. `npm run check` passes.

---

## Phase 3: User Story 2 - Update an Existing Community Post (Priority: P2)

**Goal**: An authenticated author can update their post's title, content, category, and attachments with proper ownership check and attachment diff handling.

**Independent Test**: Create a post, then call the update action with modified data and verify the database reflects changes including attachment additions and removals.

### Implementation for User Story 2

- [x] T005 [US2] Implement `updateCommunityPostQuery(postId, data)` in `modules/community/queries.ts` — authenticate with `authHandler()`. Validate input with `zodValidation(updateCommunityPostServerSchema, data)`. Extract update fields (title, content, post_category) excluding attachments from validated data. **No-op guard**: if none of title/content/post_category are present in `data` AND no `attachments` are provided, return early with a success response (no DB call needed — a zero-field update is a valid no-op). Otherwise, update `community_posts` row with `.eq('post_id', postId).eq('author_id', user.id)` for ownership check. **After the update call, inspect the returned data**: if the response data is null or an empty array (0 rows affected), throw a `CustomError` — first attempt a `select` by `post_id` alone to distinguish "not found" (post doesn't exist → throw `CustomError('Post not found')`) from "forbidden" (post exists but author_id mismatch → throw `CustomError('You are not authorised to edit this post')`). This satisfies US2 acceptance scenarios 3 and 4.
- [x] T006 [US2] Implement attachment diff logic in `updateCommunityPostQuery` in `modules/community/queries.ts` — after updating the post row, if `attachments` is provided: (1) fetch current attachments with `client.from('community_posts_attachments').select('*').eq('post_id', postId)`, (2) compute URLs to delete (current URLs not in incoming array) and delete those rows, (3) compute new URLs (incoming URLs not in current set, where `isExisting` is not true) and insert new rows. Follow diff strategy from `specs/003-community-post-queries/data-model.md`.
- [x] T007 [US2] Implement `updateCommunityPostAction` in `modules/community/actions.ts` — wrap `updateCommunityPostQuery` with `errorHandler()`. After success, call `revalidatePath('/community')` and `revalidatePath('/community/${postId}')`. Follow `updateListingAction` pattern in `modules/listings/actions.ts:106-117`.

**Checkpoint**: Update action modifies post fields and correctly handles attachment diffs. Ownership check prevents non-authors from updating. `npm run check` passes.

---

## Phase 4: User Story 3 - Fetch Community Post Details (Priority: P3)

**Goal**: Fetch a single community post with all its attachments for pre-populating the edit form.

**Independent Test**: Create a post with attachments, call the details query, and verify returned data matches the inserted records.

### Implementation for User Story 3

- [x] T008 [US3] Implement `getCommunityPostDetailsQuery(postId)` in `modules/community/queries.ts` — use Supabase relational query: `client.from('community_posts').select('*, community_posts_attachments(*)').eq('post_id', postId).single()`. Return the post with nested attachments array, or `null` if not found. Follow `getListingDetailsQuery` pattern in `modules/listings/queries.ts:68-119`.
- [ ] T009 [US3] Implement `getCommunityPostDetailsAction` in `modules/community/actions.ts` — wrap `getCommunityPostDetailsQuery` with `errorHandler()`. No revalidation needed for read operations. Follow `getListingDetailsAction` pattern in `modules/listings/actions.ts:24`.

**Checkpoint**: Details action returns full post data with attachments array. `npm run check` passes.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and code quality

- [ ] T010 Run `npm run check` (format + lint + type-check) and fix any issues across all new files in `modules/community/`
- [ ] T011 Review all exports from `modules/community/actions.ts` and verify each action follows the `{ success, data?, message?, errors? }` response format via `errorHandler()` wrapper

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — server schemas first
- **Phase 2 (US1 - Create)**: Depends on Phase 1 (needs server schemas)
- **Phase 3 (US2 - Update)**: Depends on Phase 1 (needs server schemas); shares `queries.ts` file with US1 so must be sequential
- **Phase 4 (US3 - Details)**: Depends on Phase 1; shares `queries.ts` file, sequential after US1/US2
- **Phase 5 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US1 (Create)**: After Phase 1 — no dependencies on other stories
- **US2 (Update)**: After Phase 1 — logically independent from US1 but shares `queries.ts` file, so sequential recommended
- **US3 (Details)**: After Phase 1 — independent read operation, but shares `queries.ts` file

### Within Each User Story

- Query function before action wrapper
- Attachment logic after core query function
- Action wraps the completed query

### Parallel Opportunities

- T002 and T004 are in different files (`queries.ts` vs `actions.ts`) but T004 depends on T002's export — sequential
- T008 and T009 follow the same pattern — sequential (T009 wraps T008)
- Within Phase 5, T010 and T011 can run in parallel

---

## Parallel Example: Phase 5

```bash
# Launch polish tasks together:
Task: "Run npm run check and fix issues across modules/community/"
Task: "Review all exports from modules/community/actions.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Server schemas
2. Complete Phase 2: Create query + action
3. **STOP and VALIDATE**: Verify create action returns correct response shape
4. Proceed to remaining stories

### Incremental Delivery

1. Phase 1 → Server schemas ready
2. Add US1 (Create) → Core write operation functional
3. Add US2 (Update) → Edit capability with attachment diffs
4. Add US3 (Details) → Read for edit form pre-population
5. Phase 5 → Final polish and validation

---

## Notes

- All three query functions go in the same `queries.ts` file — tasks are sequential within that file
- All three action wrappers go in the same `actions.ts` file — tasks are sequential within that file
- No test tasks generated (not requested in spec; verification happens in Phase 4/5 of the overall project)
- Commit after each completed user story phase (3 commits: create, update, details)
- Each task description includes the specific pattern reference file and line numbers for implementation guidance
