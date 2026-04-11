# Spec Review: 007-post-card-component

- Branch: `007-post-card-component`
- Review file: 001review.md

## Summary

- Overall status: **PARTIAL**
- High-risk issues: 2 (formatting issues, `differenceInDays` edge-case ambiguity)
- Missing tests / regression risk: No automated tests (spec explicitly says "Tests: Not requested")
- Test suite results: N/A (no pytest — this is a Next.js/TS project)
- Type-check: 0 errors, clean
- Lint: 0 errors related to post-card (10 warnings, all in unrelated files)
- Prettier: 6 files with formatting issues (mostly spec markdown files + CLAUDE.md, not production code)

## Task-by-task Verification

### Task T001: Create PostCardProps and CategoryColorMap types

- Spec requirement: Types for `PostCardProps` (single `post` prop of `FeedPost`, required `onOpenComments` callback) and `CategoryColorMap`.
- Implementation found:
  - Files: `modules/community/components/post-card/types/index.ts`
  - Key symbols: `PostCardProps`, `PostCategory`, `CategoryColors`, `CategoryColorMap`
- Status: **PASS**
- Evidence: `PostCardProps` has `post: FeedPost` and `onOpenComments: (postId: string) => void` (required). `CategoryColorMap` maps `PostCategory` to `CategoryColors` (bg + text strings). Matches FR-017.

### Task T002: Create constants (category color map, avatar palette, time threshold)

- Spec requirement: Category colors (questions→blue, tips→green, news→amber, troubleshooting→red), 6-color avatar palette, 7-day threshold, `getAvatarColorIndex` via charCodeSum.
- Implementation found:
  - Files: `modules/community/components/post-card/constants.ts`
  - Key symbols: `AVATAR_PALETTE`, `CATEGORY_COLOR_MAP`, `SEVEN_DAY_THRESHOLD_MS`, `getAvatarColorIndex`
- Status: **PASS**
- Evidence: All 4 category mappings present with correct color families. Avatar palette has 6 entries (`slate-500`, `red-500`, `amber-500`, `emerald-500`, `sky-500`, `violet-500`). `getAvatarColorIndex` uses charCode sum mod palette length. `SEVEN_DAY_THRESHOLD_MS` defined (though the PostCard uses `differenceInDays` instead — see note under T006).

### Task T003: Create barrel export file

- Spec requirement: Export PostCard and PostCardSkeleton.
- Implementation found:
  - Files: `modules/community/components/post-card/index.ts`
- Status: **PASS**
- Evidence: Exports both `PostCard` and `PostCardSkeleton`.

### Task T004: Implement `useCurrentUser` shared hook

- Spec requirement: Shared hook in `hooks/use-current-user.ts`, calls `supabase.auth.getUser()` on mount, returns `{ user, isLoading }`.
- Implementation found:
  - Files: `hooks/use-current-user.ts`
  - Key symbols: `useCurrentUser`
- Status: **PASS**
- Evidence: Uses `createClient()` from `@/lib/supabase/client`, calls `getUser()` in `useEffect`, returns `{ user, isLoading }`. Has `'use client'` directive. Clean implementation.

### Task T005: Build PostCardSkeleton server component

- Spec requirement: Shimmer placeholders matching card visual footprint (avatar, title, content lines, action bar). No `'use client'` directive. No props. Single card.
- Implementation found:
  - Files: `modules/community/components/post-card/PostCardSkeleton.tsx`
- Status: **PASS**
- Evidence: No `'use client'` directive. No props. Renders avatar circle, name/time lines, category badge, title bar, 2 content lines, action bar with like/comment/share/bookmark placeholders. Uses `animate-pulse`. Matches FR-014.

### Task T006: Build static PostCard layout

- Spec requirement: Author avatar (initials fallback + deterministic color), author name, relative/absolute publish time (7-day threshold), category badge, title (1-line clamp), content preview (2-line clamp, newlines collapsed, empty body reserves space), attachment indicator, like/comment counts (compact notation).
- Implementation found:
  - Files: `modules/community/components/post-card/PostCard.tsx`
  - Key symbols: `PostCard`, avatar initials logic, `differenceInDays`, `formatDistanceToNow`, `formatCount`
- Status: **PASS**
- Evidence:
  - Avatar: initials from first 2 tokens, deterministic color via `getAvatarColorIndex`. Image fallback to initials when no `avatar_url`. White text on colored bg.
  - Time: uses `differenceInDays` < 7 check, `formatDistanceToNow` for recent, `format` for older. Locale-aware.
  - Category badge: colored per `CATEGORY_COLOR_MAP`, localized label via `t()`.
  - Title: `line-clamp-1` inside `<h3>`.
  - Content: `line-clamp-2` with newline collapse via regex. Empty body reserves space with `min-h-[2lh]`.
  - Attachment: shown when `post.attachments.length > 0` with Paperclip icon + count.
  - Counts: `Intl.NumberFormat` with `notation: 'compact'`.
- Note: `SEVEN_DAY_THRESHOLD_MS` constant is defined but not used — the card uses `differenceInDays` directly, which is functionally equivalent and arguably cleaner. Not a defect.

### Task T007: Add English i18n keys

- Spec requirement: Keys under `PostCard.*` including category labels, deleted user fallback, attachment count, action labels, toast messages, accessible labels.
- Implementation found:
  - Files: `messages/en.json` (lines 733-756)
- Status: **PASS**
- Evidence: All required keys present: `deletedUser`, `like`, `unlike`, `bookmark`, `unbookmark`, `share`, `openComments`, `shareCopied`, `shareError`, `bookmarkAdded`, `bookmarkRemoved`, `likeError`, `bookmarkError`, `attachments` (ICU plural), `openCommentsFor`, `viewProfile`, `categories.*`.

### Task T008: Add Arabic i18n keys

- Spec requirement: Mirrored Arabic translations.
- Implementation found:
  - Files: `messages/ar.json` (lines 733-756)
- Status: **PASS**
- Evidence: All keys mirrored with Arabic translations. `deletedUser` = "مستخدم محذوف" as specified in spec.

### Task T009: Wire exports in barrel

- Status: **PASS** (covered by T003)

### Task T010: Create `usePostCard` hook with like logic

- Spec requirement: Optimistic like toggle, auth check via `useCurrentUser`, guest redirect with locale-prefixed pathname, in-flight guard, error toast on failure, no success toast.
- Implementation found:
  - Files: `modules/community/components/post-card/hooks/usePostCard.ts`
  - Key symbols: `usePostCard`, `handleLike`, `likeInFlight`
- Status: **PASS**
- Evidence:
  - Auth loading guard: `if (isAuthLoading || likeInFlight.current) return` — correct per FR-012.
  - Guest redirect: builds `/${locale}/login?redirect=${encodeURIComponent(redirectTarget)}` where `redirectTarget = pathname + window.location.search`. Uses `router.push()`. Matches FR-012.
  - Optimistic: toggles `isLiked` and `likeCount` before `await togglePostLikeAction`. Reverts on `!result.success`.
  - No success toast, only `toast.error` on failure — matches FR-007.
  - In-flight guard via `useRef(false)`.

### Task T011: Integrate like action into PostCard UI

- Spec requirement: Heart icon (filled/outline), like count, keyboard accessible button, ARIA label.
- Implementation found:
  - Files: `modules/community/components/post-card/PostCard.tsx` (lines 172-184)
- Status: **PASS**
- Evidence: `<button>` with `aria-label` toggling between `t('like')` / `t('unlike')`, `aria-pressed`. Heart icon with conditional `fill-red-500 text-red-500`. Count via `formatCount(likeCount)`. Focus-visible ring.

### Task T012: Add bookmark state and `handleBookmark` to hook

- Spec requirement: Same pattern as like, success toast on completion, error toast on failure.
- Implementation found:
  - Files: `modules/community/components/post-card/hooks/usePostCard.ts` (lines 58-88)
- Status: **PASS**
- Evidence: `bookmarkInFlight` ref, auth guard, guest redirect, optimistic toggle, `togglePostBookmarkAction`, success toast (`bookmarkAdded`/`bookmarkRemoved`), error toast. Matches FR-008.

### Task T013: Integrate bookmark action into PostCard UI

- Spec requirement: Bookmark icon (filled/outline), keyboard accessible, ARIA labels.
- Implementation found:
  - Files: `modules/community/components/post-card/PostCard.tsx` (lines 209-220)
- Status: **PASS**
- Evidence: `<button>` with `aria-label` toggling, `aria-pressed`, conditional `fill-current`. Focus-visible ring.

### Task T014: Add `handleShare` to hook

- Spec requirement: Build canonical URL `/community/${postId}`, clipboard write, success/error toast, no auth gating.
- Implementation found:
  - Files: `modules/community/components/post-card/hooks/usePostCard.ts` (lines 91-99)
- Status: **PASS**
- Evidence: Builds `${window.location.origin}/community/${post.post_id}`, `navigator.clipboard.writeText()` in try/catch, success and error toasts. No auth check. Matches FR-010.

### Task T015: Integrate share action into PostCard UI

- Status: **PASS**
- Evidence: Share button at line 199-205 with `Share2` icon, `aria-label`, focus-visible ring.

### Task T016: Add `handleOpenComments` to hook

- Spec requirement: Wraps `onOpenComments(post.post_id)`, no auth gating.
- Implementation found:
  - Files: `modules/community/components/post-card/hooks/usePostCard.ts` (lines 102-104)
- Status: **PASS**
- Evidence: Simple wrapper calling `onOpenComments(post.post_id)`. No auth check.

### Task T017: Wire comment-open hotspots in PostCard UI

- Spec requirement: Comment icon button (with count), title as `<h3>` wrapping unstyled `<button>`, content preview as unstyled `<button>`, all with accessible labels.
- Implementation found:
  - Files: `modules/community/components/post-card/PostCard.tsx`
- Status: **PASS**
- Evidence:
  - Title: `<h3>` wrapping `<button>` with `aria-label` via `t('openCommentsFor', { title })` — matches FR-011a.
  - Content preview: `<button>` with same accessible label — matches FR-011a.
  - Comment icon: `<button>` with `aria-label`, `MessageCircle` icon, formatted count — matches FR-011.
  - All three invoke `handleOpenComments`.

### Task T018: Wire author header link

- Spec requirement: Author avatar and name as `<a>` to `/[locale]/profile/[userId]`, deleted authors non-interactive.
- Implementation found:
  - Files: `modules/community/components/post-card/PostCard.tsx` (lines 99-123)
- Status: **PASS**
- Evidence: When `isDeletedAuthor` is false, renders `<a href={\`/${locale}/profile/${author.id}\`}>`with`aria-label`via`t('viewProfile')`. When deleted, renders `<div>` (non-interactive). Matches FR-011b.

### Task T019: Refine PostCardSkeleton dimensions

- Spec requirement: Pixel-level match with real PostCard footprint, no `'use client'`.
- Status: **PASS**
- Evidence: Same outer structure (`border-border bg-card space-y-3 rounded-xl border p-4`), same gap pattern, same element count. No `'use client'`.

### Task T020: Accessibility audit

- Spec requirement: All interactive elements keyboard reachable, visible focus states, ARIA labels, semantic HTML, contrast.
- Status: **PASS**
- Evidence: All buttons have `focus-visible:ring-2`, `aria-label`, `aria-pressed` where applicable. `<h3>` for title, `<button>` for hotspots, `<a>` for author link. Icons have `aria-hidden="true"`.

### Task T021: RTL/responsive verification

- Status: **PASS** (structural — verified `ms-auto` for logical margin, `text-start` for directional text, no hardcoded `left`/`right`)

### Task T022: Run `npm run check`

- Spec requirement: Format + lint + type-check passes.
- Status: **PARTIAL**
- Evidence: Type-check: 0 errors. Lint: 0 errors (10 warnings in unrelated files). Prettier: 6 files have formatting issues (CLAUDE.md + 5 spec markdown files). No production code formatting issues.

### Task T023: Lighthouse audit

- Spec requirement: LCP < 2.5s, FID < 100ms, CLS < 0.1.
- Status: **UNKNOWN**
- Evidence: Cannot run Lighthouse in this environment. Requires browser-based audit.

### Task T024: Quickstart validation

- Spec requirement: Render PostCard and PostCardSkeleton in community feed page.
- Status: **UNKNOWN**
- Evidence: Would need to verify integration in the actual community feed page. The components are exported and structurally complete.

## Issues List (Consolidated)

### Issue 1: Prettier formatting failures on spec/config files

- [x] FIXED
- Severity: LOW
- Depends on: none
- Affected tasks: T022
- Evidence (paths/symbols): `CLAUDE.md`, `specs/007-post-card-component/data-model.md`, `specs/007-post-card-component/plan.md`, `specs/007-post-card-component/quickstart.md`, `specs/007-post-card-component/research.md`, `specs/007-post-card-component/tasks.md`
- Root cause analysis: Markdown files were written/edited without running Prettier afterward.
- Proposed solution: Run `npx prettier --write CLAUDE.md specs/007-post-card-component/data-model.md specs/007-post-card-component/plan.md specs/007-post-card-component/quickstart.md specs/007-post-card-component/research.md specs/007-post-card-component/tasks.md`
- Test plan: Run `npm run check-format` — should pass with 0 warnings.
- Notes: These are non-production files. The actual component code passes formatting.
- Fix notes: Ran `npx prettier --write` on the 6 listed files plus `001review.md` itself. `npm run check-format` now passes with 0 warnings.

### Issue 2: Unused constant `SEVEN_DAY_THRESHOLD_MS`

- [x] FIXED
- Severity: LOW
- Depends on: none
- Affected tasks: T002, T006
- Evidence (paths/symbols): `modules/community/components/post-card/constants.ts:31` defines `SEVEN_DAY_THRESHOLD_MS`. `PostCard.tsx:52` uses `differenceInDays(new Date(), publishedDate) < 7` instead.
- Root cause analysis: The constant was created per the task spec but the PostCard implementation chose to use `differenceInDays` (a cleaner, more readable approach). The constant is now dead code.
- Proposed solution: Either (a) remove `SEVEN_DAY_THRESHOLD_MS` from `constants.ts` since it's unused, or (b) use it in PostCard.tsx by replacing `differenceInDays` with a millisecond comparison. Option (a) is recommended — the `differenceInDays` approach is idiomatic.
- Test plan: `npm run type-check && npm run lint` — verify no errors introduced.
- Notes: This is a code hygiene issue, not a functional defect.
- Fix notes: Removed `export const SEVEN_DAY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;` from `modules/community/components/post-card/constants.ts`. `npm run type-check && npm run lint` pass with 0 errors.

### Issue 3: Lighthouse audit not performed (T023)

- [ ] FIXED
- Blocked: Requires a running browser (Chrome DevTools / Lighthouse CI). Cannot be performed in a headless/CLI-only environment.
- Severity: MED
- Depends on: none
- Affected tasks: T023
- Evidence: Task T023 is unchecked in tasks.md.
- Root cause analysis: Lighthouse requires a running browser; cannot be performed in a CI/headless-only environment without setup.
- Proposed solution: Run Lighthouse in Chrome DevTools (Incognito) on the community feed page with PostCard rendered. Verify LCP < 2.5s, FID < 100ms, CLS < 0.1. Alternatively, set up `lighthouse-ci` for automated checks.
- Test plan: Open Chrome DevTools → Lighthouse tab → run Mobile + Desktop audits on the community feed page.
- Notes: The skeleton swap design (same outer dimensions, no layout shift) should give CLS ≈ 0. LCP depends on feed data loading, not the card itself.

## Fix Plan (Ordered)

1. Issue 1: Prettier formatting — run `npx prettier --write` on 6 files
2. Issue 2: Unused constant — remove `SEVEN_DAY_THRESHOLD_MS` from `constants.ts`
3. Issue 3: Lighthouse audit — manual browser audit required

## Handoff to Coding Model (Copy/Paste)

- **Files to edit**:
  - `modules/community/components/post-card/constants.ts` — remove `SEVEN_DAY_THRESHOLD_MS` export (line 31)
  - 6 markdown files — run Prettier
- **Exact behavior changes**: None — these are cleanup/hygiene fixes
- **Edge cases**: None
- **Tests to add/update**: None
- **Suggested commit breakdown**:
  1. `chore: fix prettier formatting on spec markdown files`
  2. `refactor(post-card): remove unused SEVEN_DAY_THRESHOLD_MS constant`
