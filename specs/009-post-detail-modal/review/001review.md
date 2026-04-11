# Spec Review: 009-post-detail-modal

- Branch: 009-post-detail-modal
- Review file: 001review.md

## Summary

- Overall status: PASS
- High-risk issues: 0
- Missing tests / regression risk: No tests requested per spec
- Check results: 0 errors, 11 warnings (0 from this feature)
- Lint: PASS
- Type-check: PASS
- Format: PASS

## Task-by-task Verification

### Task T001: Create shadcn Dialog component

- Spec requirement: `components/ui/dialog.tsx` with Radix Dialog, centered modal, RTL-aware
- Implementation found:
  - Files: `components/ui/dialog.tsx`
  - Key symbols: Dialog, DialogContent, DialogOverlay, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogPortal, DialogTrigger
- Status: PASS
- Evidence: File exists with correct `radix-ui` import, `start-[50%]`, `end-4` close button, `rtl:-translate-x-[-50%]`, data-slot attributes, all exports present.

### Task T002: Create @modal parallel route default

- Spec requirement: `app/[locale]/(main)/@modal/default.tsx` returns null
- Implementation found:
  - Files: `app/[locale]/(main)/@modal/default.tsx`
- Status: PASS
- Evidence: Returns `null` as required.

### Task T003: Create catch-all safety net

- Spec requirement: `app/[locale]/(main)/@modal/[...catchAll]/page.tsx` returns null
- Implementation found:
  - Files: `app/[locale]/(main)/@modal/[...catchAll]/page.tsx`
- Status: PASS
- Evidence: Returns `null` as required.

### Task T004: Update main layout to accept modal slot prop

- Spec requirement: Layout accepts `modal` prop and renders `{modal}` after main
- Implementation found:
  - Files: `app/[locale]/(main)/layout.tsx`
- Status: PASS
- Evidence: Layout accepts `{ children, modal }` props.

### Task T005: Create PostDetailContext provider

- Spec requirement: Context with `useSyncExternalStore`, `PostUpdatePayload`, subscribe pattern
- Implementation found:
  - Files: `modules/community/components/post-detail-context/PostDetailContext.tsx`
  - Key symbols: `PostDetailProvider`, `usePostDetailContext`, `usePostUpdate`, `PostUpdatePayload`
- Status: PASS
- Evidence: Matches spec exactly with `useSyncExternalStore`, `Map<string, PostUpdatePayload>`, subscribe/getPostUpdate/updatePost pattern.

### Task T006: Wrap main layout with PostDetailProvider

- Spec requirement: Wrap ONLY `{children}` and `{modal}`, NOT `<Navbar />`
- Implementation found:
  - Files: `app/[locale]/(main)/layout.tsx`
- Status: PASS
- Evidence: `<Navbar />` is outside `<PostDetailProvider>`. Only `<main>{children}</main>` and `{modal}` are wrapped.

### Task T007: Add i18n keys for PostDetail namespace

- Spec requirement: `PostDetail` namespace in both `en.json` and `ar.json`
- Implementation found:
  - Files: `messages/en.json:758`, `messages/ar.json:758`
- Status: PASS
- Evidence: Both files contain `PostDetail` namespace with modal, comments, commentInput, commentActions, deleteConfirm, errors, fullPage sections.

### Task T008: Create post detail types

- Spec requirement: `PostDetailModalProps` type
- Implementation found:
  - Files: `modules/community/components/post-detail-modal/types/index.ts`
- Status: PASS
- Evidence: Type defined correctly importing `FeedPost`.

### Task T009: Create PostDetailSkeleton

- Spec requirement: Loading skeleton with animate-pulse
- Implementation found:
  - Files: `modules/community/components/post-detail-modal/components/post-detail-skeleton/PostDetailSkeleton.tsx`
- Status: PASS
- Evidence: Renders avatar, name, date, title, content, and action bar placeholders with `animate-pulse`.

### Task T010: Create PostDetailHeader

- Spec requirement: Author avatar + name + relative date + category badge
- Implementation found:
  - Files: `modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx`
- Status: PASS
- Evidence: Uses `formatDistanceToNow`, `CATEGORY_COLOR_MAP`, `AVATAR_PALETTE`, deleted user handling, locale-aware date, `next/image` for avatar.

### Task T011: Create PostDetailContent

- Spec requirement: Full untruncated content with attachment gallery
- Implementation found:
  - Files: `modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent.tsx`
- Status: PASS
- Evidence: `whitespace-pre-wrap` for content, responsive grid for attachments (1-col for 1 image, 2-col for 2+), `next/image` with fill.

### Task T012: Create PostDetailActions

- Spec requirement: Like/bookmark/share bar with auth gating, context sync, optimistic updates
- Implementation found:
  - Files: `modules/community/components/post-detail-modal/components/post-detail-actions/PostDetailActions.tsx`
  - Key symbols: `handleLike`, `handleBookmark`, `handleShare`, `updatePost`
- Status: PASS
- Evidence: Auth gating present, optimistic updates work, context sync via `updatePost`.

### Task T013: Create PostDetailModal shell

- Spec requirement: Dialog wrapper with post content, always open, `router.back()` on close
- Implementation found:
  - Files: `modules/community/components/post-detail-modal/PostDetailModal.tsx`
- Status: PASS
- Evidence: `open={true}`, `onOpenChange` triggers `router.back()`, `max-h-[85vh]`, `overflow-y-auto`, `sr-only` DialogTitle, correct layout structure per T026.

### Task T014: Create modal barrel export

- Spec requirement: `index.ts` exporting `PostDetailModal`
- Implementation found:
  - Files: `modules/community/components/post-detail-modal/index.ts`
- Status: PASS

### Task T015: Create intercepting route page

- Spec requirement: Server component fetching post data, passing to modal
- Implementation found:
  - Files: `app/[locale]/(main)/@modal/(.)community/[postId]/page.tsx`
- Status: PASS
- Evidence: Async server component, awaits params, calls `getCommunityPostDetailAction`, returns null on failure, passes data to `PostDetailModal`.

### Task T016: Create full-page fallback view (PostDetailView)

- Spec requirement: Client component receiving pre-fetched data, NOT fetching itself
- Implementation found:
  - Files: `modules/community/post-detail/PostDetailView.tsx`
  - Key symbols: `PostDetailView`
- Status: PASS
- Evidence: `'use client'`, receives `post` prop, no data fetching, renders header/content/actions/comments.

### Task T017: Create full-page route (server component)

- Spec requirement: Server component fetching data, passing to `PostDetailView`, `notFound()` on failure
- Implementation found:
  - Files: `app/[locale]/(main)/community/[postId]/page.tsx`
- Status: PASS
- Evidence: Correct server-side fetch and `notFound()` on failure.

### Task T018: Update PostCard types (remove onOpenComments)

- Spec requirement: Remove `onOpenComments` from `PostCardProps`
- Implementation found:
  - Files: `modules/community/components/post-card/types/index.ts`
- Status: PASS
- Evidence: `PostCardProps` only has `{ post: FeedPost }`.

### Task T019: Update usePostCard hook (remove onOpenComments, add context sync)

- Spec requirement: Remove `onOpenComments`, add `usePostUpdate` context integration
- Implementation found:
  - Files: `modules/community/components/post-card/hooks/usePostCard.ts`
  - Key symbols: `usePostUpdate`, `effectiveLiked`, `effectiveLikeCount`, `effectiveBookmarked`
- Status: PASS
- Evidence: `onOpenComments` removed, `usePostUpdate` integrated for liked/likeCount/bookmarked/commentCount.

### Task T020: Update PostCard component (Link navigation)

- Spec requirement: Replace buttons with `<Link>` for title, content, comment icon
- Implementation found:
  - Files: `modules/community/components/post-card/PostCard.tsx`
- Status: PASS
- Evidence: Title (line 141), content (line 150), comment button (line 183) all use `<Link href={/${locale}/community/${post.post_id}}>`.

### Task T021: Update FeedList (remove onOpenComments)

- Spec requirement: Remove `handleOpenComments` callback and prop
- Implementation found:
  - Files: `modules/community/community-feed/components/feed-list/FeedList.tsx`
- Status: PASS
- Evidence: No `handleOpenComments`, PostCard rendered as `<PostCard key={post.post_id} post={post} />`.

### Task T022: Create comment section types

- Spec requirement: Types for CommentSection, CommentInput, CommentItem, CommentList
- Implementation found:
  - Files: `modules/community/components/comments/types/index.ts`
- Status: PASS
- Evidence: All types present and matching spec.

### Task T023: Create useCommentSection hook

- Spec requirement: Comment state management with optimistic updates, likeInFlight guard
- Implementation found:
  - Files: `modules/community/components/comments/hooks/useCommentSection.ts`
  - Key symbols: `useCommentSection`, `loadComments`, `addComment`, `editComment`, `deleteComment`, `toggleCommentLike`, `likeInFlight`
- Status: PASS
- Evidence: All operations implemented with optimistic updates, `likeInFlight` Set-based guard, context sync for comment count, proper error handling with toast + reload revert. Uses `useEffect` for initial load (cleaner than the spec's `initialLoadDone.current` ref approach — functionally equivalent).

### Task T024: Create CommentInput

- Spec requirement: Sticky input with reply indicator, char count, Enter submit, auto-resize
- Implementation found:
  - Files: `modules/community/components/comments/components/comment-input/CommentInput.tsx`
- Status: PASS
- Evidence: Sticky via `sticky bottom-0`, reply indicator with X dismiss, char count when >1900, Enter/Shift+Enter handling, auto-resize textarea, 2000 char max validation.

### Task T025: Create CommentSection container

- Spec requirement: Wires hook to components, shows auth-dependent input
- Implementation found:
  - Files: `modules/community/components/comments/CommentSection.tsx`
- Status: PASS
- Evidence: All wiring correct, skeleton/empty/list rendering.

### Task T026: Integrate CommentSection into PostDetailModal

- Spec requirement: CommentSection inside modal with definitive layout structure
- Implementation found:
  - Files: `modules/community/components/post-detail-modal/PostDetailModal.tsx`
- Status: PASS
- Evidence: Matches definitive layout from T026 spec: `p-0 gap-0`, `shrink-0` header, `flex-1 overflow-y-auto` content area with CommentSection.

### Task T027: Create CommentSkeleton

- Spec requirement: 3 skeleton items with avatar, content lines, action placeholders
- Implementation found:
  - Files: `modules/community/components/comments/components/comment-skeleton/CommentSkeleton.tsx`
- Status: PASS

### Task T028: Create CommentItem

- Spec requirement: Author info, content, edit form, like/reply/delete actions, RTL indentation
- Implementation found:
  - Files: `modules/community/components/comments/components/comment-item/CommentItem.tsx`
- Status: PASS
- Evidence: Full implementation with avatar, relative time, edited indicator, inline edit form, like button with fill, reply button (top-level only), options menu (own comment only), AlertDialog for delete, `ms-10` for RTL indentation.

### Task T029: Create CommentList

- Spec requirement: List with Load More at top, replies rendered under parent
- Implementation found:
  - Files: `modules/community/components/comments/components/comment-list/CommentList.tsx`
- Status: PASS
- Evidence: Load More button at top, comments mapped with replies beneath, reply button not passed to reply items.

### Task T030: Replace placeholder with CommentList

- Spec requirement: Replace placeholder div with real CommentList
- Implementation found:
  - Files: `modules/community/components/comments/CommentSection.tsx`
- Status: PASS
- Evidence: CommentList rendered with all props, CommentSkeleton imported.

### Task T031: Verify edit flow (US4)

- Spec requirement: Verify edit → inline textarea → save/cancel works
- Status: PASS
- Evidence: CommentItem renders inline textarea when `isEditing`, Save calls `onEdit`, Cancel calls `onCancelEdit`. Edit validation skips empty or unchanged content.

### Task T032: Add delete confirmation (US5)

- Spec requirement: AlertDialog confirmation before delete
- Implementation found:
  - Files: `modules/community/components/comments/components/comment-item/CommentItem.tsx:178-208`
- Status: PASS
- Evidence: AlertDialog wraps delete button with title, message, cancel, and destructive confirm action.

### Task T033: Verify like toggle (US6)

- Spec requirement: Heart toggle with count, optimistic update, inflight guard
- Status: PASS
- Evidence: Heart icon with fill state, count display, `onToggleLike` wired, hook has `likeInFlight` Set guard.

### Task T034: Verify reply flow (US7)

- Spec requirement: Reply → indicator → submit → appears under parent
- Status: PASS
- Evidence: Reply button calls `onReply`, CommentInput shows "Replying to" indicator, submit passes `parentCommentId`, hook adds to parent's replies array.

### Task T035: Keyboard accessibility

- Spec requirement: Focus trap, aria-labels, aria-pressed, tab order, focus-visible
- Status: PASS
- Evidence: Dialog provides focus trap (Radix). All buttons have `aria-label`. Focus-visible states present. `aria-pressed` present on like buttons.

### Task T036: RTL audit

- Spec requirement: Audit and fix all LTR-only classes in new files
- Status: PASS
- Evidence: Dialog uses `start-[50%]`, `end-4`. CommentItem uses `ms-10`, `ms-auto`. CommentInput uses `end-3` for char count. No `ml-`, `mr-`, `left-`, `right-` found in new files.

### Task T037: Verify full-page view

- Spec requirement: Full-page post detail renders with comments
- Status: PASS
- Evidence: Server component fetches data, passes to client `PostDetailView` which renders header, content, actions, and CommentSection.

### Task T038: Run npm run check

- Spec requirement: Fix all lint/type/format errors
- Status: PASS
- Evidence: Type-check passes. Lint has 0 errors.

## Issues List (Consolidated)

IMPORTANT: Issues ordered by fix dependency (fix A before B if B depends on A).

### Issue 1: Login redirect missing locale prefix in PostDetailActions

- [x] FIXED
- Severity: BLOCKER
- Depends on: none
- Affected tasks: T012
- Evidence: `PostDetailActions.tsx:36` uses `/login?redirect=...`
- Fix notes: Added `useLocale()` and prefixed redirect paths with `/${locale}`.

### Issue 2: Share URL missing locale prefix

- [x] FIXED
- Severity: HIGH
- Depends on: none
- Affected tasks: T012 (PostDetailActions), T019 (usePostCard — pre-existing)
- Evidence: Share URLs constructed without `locale`.
- Fix notes: Added `locale` prefix to share URL construction in both `PostDetailActions.tsx` and `usePostCard.ts`.

### Issue 3: Console.log debug statements in production route

- [x] FIXED
- Severity: HIGH
- Depends on: none
- Affected tasks: T017
- Evidence: `app/[locale]/(main)/community/[postId]/page.tsx:11-14` has `console.log`
- Fix notes: Removed debug `console.log` statements.

### Issue 4: Comment count not synced to feed via context

- [x] FIXED
- Severity: BLOCKER
- Depends on: none
- Affected tasks: T019, T020
- Evidence: `PostCard.tsx:189` uses raw `post.comment_count`.
- Fix notes: Updated `usePostCard` to extract `comment_count` from context and `PostCard` to use this synced value.

### Issue 5: Hardcoded English string in CommentSection

- [x] FIXED
- Severity: MED
- Depends on: none
- Affected tasks: T025
- Evidence: Hardcoded "Please log in..." string.
- Fix notes: Added `loginToComment` key to `en.json` and `ar.json` and updated `CommentSection.tsx` to use `t()`.

### Issue 6: Missing aria-pressed on comment like button + unused import

- [x] FIXED
- Severity: MED
- Depends on: none
- Affected tasks: T028, T035, T038
- Evidence: `aria-pressed` missing in `CommentItem.tsx`; unused `MessageCircle` in `PostDetailActions.tsx`.
- Fix notes: Added `aria-pressed` to comment like button and removed unused import/commented code.

## Fix Plan (Ordered)

1. [x] Issue 1: Login redirect missing locale — Add `useLocale()` and include locale in redirect paths in PostDetailActions.tsx
2. [x] Issue 2: Share URL missing locale — Add locale to share URL in PostDetailActions.tsx and usePostCard.ts
3. [x] Issue 3: Console.log in route — Remove debug statements from `community/[postId]/page.tsx`
4. [x] Issue 4: Comment count not synced — Add `effectiveCommentCount` to usePostCard and use it in PostCard
5. [x] Issue 5: Hardcoded English string — Add i18n key and use translation in CommentSection
6. [x] Issue 6: Missing aria-pressed + unused import — Add attribute to CommentItem, clean up PostDetailActions imports
