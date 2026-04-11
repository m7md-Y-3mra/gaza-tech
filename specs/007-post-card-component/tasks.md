# Tasks: Post Card Component

**Input**: Design documents from `/specs/007-post-card-component/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create file structure, types, and constants for the post-card component

- [x] T001 Create PostCardProps and CategoryColorMap types in `modules/community/components/post-card/types/index.ts`
- [x] T002 [P] Create constants (category color map, avatar palette, time threshold) in `modules/community/components/post-card/constants.ts` — include a `getAvatarColorIndex(name: string): number` utility that computes the palette index as `charCodeSum % AVATAR_PALETTE.length`
- [x] T003 [P] Create barrel export file in `modules/community/components/post-card/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared hook that MUST be complete before any user story involving auth-gated actions

**CRITICAL**: No auth-gated user story work (US2, US3) can begin until this phase is complete

- [x] T004 Implement `useCurrentUser` shared hook in `hooks/use-current-user.ts` — calls `supabase.auth.getUser()` on mount, returns `{ user, isLoading }`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Browse community posts at a glance (Priority: P1) MVP

**Goal**: Render a static, read-only post card showing author header, category badge, title, content preview, attachment indicator, and engagement counts in both LTR and RTL.

**Independent Test**: Render a single PostCard with representative FeedPost data in both locales; verify author, category, title, preview, counts all display correctly; verify truncation; verify RTL mirrors layout.

### Implementation for User Story 1

- [x] T005 [US1] Build the PostCardSkeleton server component in `modules/community/components/post-card/PostCardSkeleton.tsx` — shimmer placeholders matching card visual footprint (avatar, title line, 2 content lines, action bar)
- [x] T006 [US1] Build the static PostCard layout in `modules/community/components/post-card/PostCard.tsx` — author avatar (with initials fallback + deterministic color), author name, relative/absolute publish time (7-day threshold, date-fns), category badge (colored per constants), title (1-line clamp), content preview (2-line clamp, newlines collapsed, empty body reserves space), attachment indicator (icon + count, hidden when 0), like count and comment count (compact notation via Intl.NumberFormat)
- [x] T007 [US1] Add English i18n keys under `PostCard.*` in `messages/en.json` — category labels, deleted user fallback (`PostCard.deletedUser`), attachment count, action labels, toast messages, accessible labels. The `deletedUser` key MUST be used by the card instead of the raw `DELETED_USER_NAME_KEY` constant for display
- [x] T008 [US1] Add Arabic i18n keys under `PostCard.*` in `messages/ar.json` — mirrored keys with Arabic translations. The `deletedUser` key MUST be used by the card instead of the raw `DELETED_USER_NAME_KEY` constant for display
- [x] T009 [US1] Wire PostCard and PostCardSkeleton exports in `modules/community/components/post-card/index.ts`

**Checkpoint**: PostCard renders all static information for a single post. Skeleton matches its footprint. Both locales work. No interactive actions yet.

---

## Phase 4: User Story 2 — Like a post optimistically (Priority: P1)

**Goal**: Authenticated users can toggle like with immediate UI feedback; failures revert; guests redirect to sign-in; rapid clicks are debounced.

**Independent Test**: Click like on a card — heart fills, count increments within one frame. Simulate server failure — UI reverts, error toast appears. Click while unauthenticated — redirect to sign-in. Click rapidly — no duplicate requests.

### Implementation for User Story 2

- [x] T010 [US2] Create `usePostCard` hook in `modules/community/components/post-card/hooks/usePostCard.ts` — optimistic like state (useState + useRef for in-flight), `handleLike` (auth check via `useCurrentUser`, guest redirect: build sign-in URL as `/${locale}/login?redirect=${encodeURIComponent(pathname + search)}` where locale comes from `useLocale()` (next-intl) and redirect value MUST be a same-origin pathname starting with `/`, use `router.push()`, optimistic toggle, call `togglePostLikeAction`, revert + error toast on failure, no success toast), ignore clicks while auth loading or in-flight
- [x] T011 [US2] Integrate like action into PostCard UI in `modules/community/components/post-card/PostCard.tsx` — heart icon (filled/outline), like count, keyboard accessible button, ARIA label reflecting state ("Like"/"Unlike"), wire `handleLike` from `usePostCard`

**Checkpoint**: Like toggle works end-to-end with optimistic UI, rollback, auth gating, and rapid-click protection.

---

## Phase 5: User Story 3 — Bookmark a post optimistically (Priority: P2)

**Goal**: Authenticated users can toggle bookmark with immediate UI feedback, success toast, and failure rollback; guests redirect to sign-in.

**Independent Test**: Click bookmark — icon toggles, success toast appears, persisted state matches. Simulate failure — UI reverts, error toast appears. Unauthenticated click redirects to sign-in.

### Implementation for User Story 3

- [x] T012 [US3] Add optimistic bookmark state and `handleBookmark` to `usePostCard` hook in `modules/community/components/post-card/hooks/usePostCard.ts` — same pattern as like (useState + useRef in-flight), call `togglePostBookmarkAction`, success toast on completion, revert + error toast on failure, ignore clicks while auth loading or in-flight
- [x] T013 [US3] Integrate bookmark action into PostCard UI in `modules/community/components/post-card/PostCard.tsx` — bookmark icon (filled/outline), keyboard accessible button, ARIA label reflecting state ("Bookmark"/"Remove bookmark"), wire `handleBookmark`

**Checkpoint**: Bookmark toggle works end-to-end alongside like. Both actions are independently functional.

---

## Phase 6: User Story 4 — Share a post via copied link (Priority: P2)

**Goal**: Any viewer (auth or guest) can copy the post's canonical URL to clipboard with a confirmation toast.

**Independent Test**: Click share — clipboard contains `/community/[postId]` resolved against origin; "Link copied" toast appears. Block clipboard permission — error toast appears.

### Implementation for User Story 4

- [x] T014 [US4] Add `handleShare` to `usePostCard` hook in `modules/community/components/post-card/hooks/usePostCard.ts` — build canonical URL (`/community/${postId}`), `navigator.clipboard.writeText()` in try/catch, success toast, error toast on failure; no auth gating
- [x] T015 [US4] Integrate share action into PostCard UI in `modules/community/components/post-card/PostCard.tsx` — share icon button, keyboard accessible, ARIA label, wire `handleShare`

**Checkpoint**: Share works for all viewers. Clipboard writes succeed or degrade gracefully.

---

## Phase 7: User Story 5 — Open comments for a post (Priority: P2)

**Goal**: Three hotspots (comment icon, title, content preview) invoke the parent-supplied `onOpenComments` callback for all viewers regardless of auth state.

**Independent Test**: Click comment icon, title, and content preview — each invokes `onOpenComments` exactly once with the correct `post_id`. Works for both authenticated and guest viewers.

### Implementation for User Story 5

- [x] T016 [US5] Add `handleOpenComments` to `usePostCard` hook in `modules/community/components/post-card/hooks/usePostCard.ts` — wraps `onOpenComments(post.post_id)`, no auth gating
- [x] T017 [US5] Wire comment-open hotspots in PostCard UI in `modules/community/components/post-card/PostCard.tsx` — comment icon button (with count), title as `<h3>` wrapping unstyled `<button>`, content preview as unstyled `<button>`, all with accessible labels (e.g., "Open comments for post '<title>'"), all invoke `handleOpenComments`
- [x] T018 [US5] Wire author header link in PostCard UI in `modules/community/components/post-card/PostCard.tsx` — author avatar and name as `<a>` to `/[locale]/profile/[userId]`, keyboard reachable, accessible label; deleted/missing authors render as non-interactive (no link)

**Checkpoint**: All interactive hotspots on the card are functional. Comment callback fires correctly. Author profile link navigates.

---

## Phase 8: User Story 6 — See a loading placeholder while posts fetch (Priority: P3)

**Goal**: PostCardSkeleton visually mirrors the real card's footprint, preventing layout shift on swap.

**Independent Test**: Render PostCardSkeleton in isolation — verify it occupies the same space as a real PostCard, no CLS on swap.

### Implementation for User Story 6

- [x] T019 [US6] Refine PostCardSkeleton dimensions in `modules/community/components/post-card/PostCardSkeleton.tsx` — ensure pixel-level match with real PostCard footprint (same padding, gaps, heights for avatar, title, content lines, action bar); verify no `'use client'` directive; verify zero CLS contribution

**Checkpoint**: Skeleton is production-ready and matches card footprint exactly.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, and final validation

- [x] T020 [P] Accessibility audit on PostCard — verify all interactive elements are keyboard reachable, have visible focus states, carry correct ARIA labels with state reflection, semantic HTML (`<h3>`, `<button>`, `<a>`), color contrast 4.5:1 on all badges and text in `modules/community/components/post-card/PostCard.tsx`
- [x] T021 [P] RTL/responsive verification — test card in Arabic locale on mobile (<=640px) and desktop (>=1024px), verify no clipped text, correct icon mirroring, correct reading order
- [x] T022 Run `npm run check` (format + lint + type-check) and fix any issues
- [ ] T023 Run Lighthouse audit and verify LCP < 2.5s, FID < 100ms, CLS < 0.1 with skeleton swap
- [x] T024 Run quickstart.md validation — render PostCard and PostCardSkeleton in community feed page to verify integration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS US2 and US3 (auth-gated actions)
- **US1 (Phase 3)**: Depends on Phase 1 (types + constants). Does NOT depend on Phase 2 (no auth needed for static display)
- **US2 (Phase 4)**: Depends on Phase 2 (useCurrentUser) + Phase 3 (PostCard layout exists)
- **US3 (Phase 5)**: Depends on Phase 2 + Phase 4 (usePostCard hook with like already built)
- **US4 (Phase 6)**: Depends on Phase 3 (PostCard layout exists). Does NOT depend on Phase 2 (no auth gating)
- **US5 (Phase 7)**: Depends on Phase 3 (PostCard layout with hotspot elements)
- **US6 (Phase 8)**: Depends on Phase 3 (need final PostCard dimensions to match)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Phase 1 — no other story dependencies
- **US2 (P1)**: After Phase 2 + US1
- **US3 (P2)**: After US2 (extends usePostCard hook)
- **US4 (P2)**: After US1 — independent of US2/US3
- **US5 (P2)**: After US1 — independent of US2/US3/US4
- **US6 (P3)**: After US1 — independent of US2-US5

### Parallel Opportunities

After Phase 2 + US1 complete:

- US4 (share) and US5 (comments) can run in parallel with US2 (like)
- US6 (skeleton refinement) can run in parallel with US2

After US2 completes:

- US3 (bookmark) can begin

---

## Parallel Example: After Phase 3 (US1) Completes

```
# These can run in parallel (different concerns, different parts of the file):
Task T014: handleShare in usePostCard (US4)
Task T016: handleOpenComments in usePostCard (US5)
Task T019: Skeleton refinement (US6)

# These must be sequential:
Task T010 → T011: Like logic then like UI (US2)
Task T012 → T013: Bookmark logic then bookmark UI (US3, after US2)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, constants, barrel export)
2. Complete Phase 2: Foundational (useCurrentUser hook)
3. Complete Phase 3: User Story 1 (static card + skeleton + i18n)
4. **STOP and VALIDATE**: Render card with sample data in both locales
5. Deploy/demo if ready — card displays all post information

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (static card) → Test independently → **MVP!**
3. US2 (like) → Test independently → Card has first interaction
4. US3 (bookmark) → Test independently → Second interaction
5. US4 (share) + US5 (comments) → Test independently → All actions work
6. US6 (skeleton polish) → Test independently → Loading state perfect
7. Polish → Accessibility + performance audit → Production-ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Total: 24 tasks across 9 phases
- No new database work — consumes existing FeedPost type and server actions
- `usePostCard` hook grows incrementally: like (US2) → bookmark (US3) → share (US4) → comments (US5)
- PostCard.tsx grows incrementally: static layout (US1) → like button (US2) → bookmark button (US3) → share button (US4) → comment hotspots (US5)
- Commit after each task or logical group per the staged development workflow
