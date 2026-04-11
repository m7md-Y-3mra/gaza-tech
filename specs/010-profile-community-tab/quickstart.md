# Quickstart: Profile Community Posts Tab

**Feature**: 010-profile-community-tab
**Date**: 2026-04-11
**Audience**: Engineers implementing or reviewing the feature, and QA running manual acceptance.

---

## Prerequisites

- Local dev server running: `npm run dev`
- At least three test accounts available:
  - **Owner A**: has at least 12 published community posts (to exercise pagination with `DEFAULT_LIMIT_NUMBER = 4` → 3+ pages).
  - **Other B**: any account that is NOT Owner A, used to verify visitor visibility.
  - **Empty C**: has zero published community posts, used to verify empty states.
- Phase 5 (post detail modal) already implemented on `main` or in a merged branch, so `/community/[postId]` and its intercepting route exist.
- Phases 1–4 (community feed queries, actions, post card) merged so the shared building blocks are available.

---

## Staged commit order (Principle III)

Each stage is independently committable and reviewable.

1. **Stage 1 — Query signature extension**
   `modules/community/queries.ts`: extend `getUserCommunityPostsQuery` to return `total_count`. Update `modules/community/types/index.ts` with `PageWithCount<T>`. No UI changes.
   **Commit**: `feat(community): return total_count from getUserCommunityPostsQuery for profile pagination`

2. **Stage 2 — Server shell + skeleton + error states**
   Create the `profile-posts-tab/` folder with `ProfilePostsTab.tsx` (server), `ProfilePostsTabSkeleton.tsx`, `ProfilePostsTabError.tsx`, `types/index.ts`, `index.ts`. Tab not yet wired into `ProfileTabs.tsx`.
   **Commit**: `feat(profile): add profile posts tab server shell, skeleton, and error boundary`

3. **Stage 3 — Client list + pagination wiring (read-only)**
   Add `ProfilePostsTabClient.tsx` rendering a list via the existing `PostCard` plus `ProfilePagination`. No owner controls yet. Wire `ProfilePostsTab` into `ProfileTabs.tsx` / `ProfileTabsClient.tsx` behind a new `postsContent` prop so the tab is visible in the UI for visitors and owners alike.
   **Commit**: `feat(profile): render user community posts in profile posts tab with pagination`

4. **Stage 4 — Owner edit/delete actions**
   Add the sibling action cluster (pencil + trash icons) rendered only when `isOwner`. Delete uses `useTransition` + `useOptimistic` + `AlertDialog` + `sonner`. Implement FR-020 (auto-navigate on empty page).
   **Commit**: `feat(profile): add edit and delete actions on owner's community posts tab`

5. **Stage 5 — Empty state CTA + "Create your first post"**
   Render the empty state with owner-only CTA linking to `/community/create`.
   **Commit**: `feat(profile): show empty state with create-first-post CTA for owner`

6. **Stage 6 — i18n + a11y polish**
   Add `Profile.Tabs.myPosts` and `Profile.PostsTab.*` keys in `messages/en.json` and `messages/ar.json`. Verify RTL mirroring, keyboard-only flow, aria-labels on all action buttons.
   **Commit**: `feat(profile): add translations and accessibility polish for community posts tab`

Stop and ask for approval after each stage before moving on.

---

## Manual acceptance script

Run in order against a local dev server. Links use absolute paths.

### US1 — View a user's community posts (P1)

1. Sign out. Navigate to `/profile/<OwnerA-userId>`.
2. **Expect**: three tabs are visible: "My Listings", "My Posts", and NOT "Saved Items" (owner-only).
3. Click "My Posts".
4. **Expect**: list of Owner A's posts ordered newest first, showing title, category badge, content preview, published date, like count, comment count. Pagination control visible at the bottom if total posts > 4.
5. Navigate to `/profile/<EmptyC-userId>`, click "My Posts".
6. **Expect**: empty state text only, no CTA (because EmptyC is not the viewer).

### US2 — Owner edits a post (P2)

1. Sign in as Owner A. Navigate to `/profile/<OwnerA-userId>`.
2. Click "My Posts".
3. **Expect**: each post card is accompanied by a pencil (Edit) icon and a trash (Delete) icon.
4. Click the pencil icon on any post.
5. **Expect**: the browser navigates to `/community/<postId>/edit` and the edit screen renders.
6. Sign in as Other B. Navigate to `/profile/<OwnerA-userId>`, click "My Posts".
7. **Expect**: NO pencil or trash icons on any card.

### US3 — Owner deletes a post (P2)

1. Sign in as Owner A. Navigate to `/profile/<OwnerA-userId>` → "My Posts".
2. Click the trash icon on any post.
3. **Expect**: AlertDialog opens with a localized title/message and Cancel / Delete buttons.
4. Click Cancel.
5. **Expect**: dialog closes, list unchanged.
6. Click trash again on the same post, then click Delete.
7. **Expect**: the card disappears within 1 second, a success toast appears. Refresh the page — the post is still gone. Open `/community` — the post is no longer in the feed either.
8. While a delete is in flight, attempt to click Delete a second time.
9. **Expect**: the second click is ignored (button disabled via `isPending`).

### US4 — Paginate (P3)

1. Sign out. Navigate to `/profile/<OwnerA-userId>?page=2` → "My Posts".
2. **Expect**: page 2 of posts is displayed, the URL shows `?page=2`, and reloading the page restores page 2.
3. Click "next" and "previous" pagination links.
4. **Expect**: list updates, URL updates.

### Edge case: delete-empties-page (FR-020)

1. Navigate to the last page of Owner A's posts so it has exactly 1 post.
2. Delete that post.
3. **Expect**: the URL `?page=` value decrements by 1, the list re-renders showing the previous page's posts.

### Edge case: click a post card (FR-019)

1. Sign out. Navigate to `/profile/<OwnerA-userId>` → "My Posts".
2. Click a post card (outside the Edit/Delete icons).
3. **Expect**: navigation to `/community/<postId>` showing the full post detail page (not an overlay modal, because intercepting routes don't apply when the origin is `/profile/*`; this is the documented fallback behavior of the detail modal pattern).

### Edge case: error state

1. Temporarily break the Supabase connection (or set an invalid `userId` that throws).
2. Open `/profile/<broken-userId>` → "My Posts".
3. **Expect**: `ProfilePostsTabError` renders with localized text; the Listings tab and the rest of the profile page are unaffected.

### Edge case: loading state

1. Throttle your network to "Slow 3G" in DevTools.
2. Navigate to `/profile/<OwnerA-userId>` and click "My Posts".
3. **Expect**: `ProfilePostsTabSkeleton` renders during the load with no layout shift.

### A11y: keyboard-only flow (SC-007)

1. Sign in as Owner A. Navigate to `/profile/<OwnerA-userId>`.
2. Using only Tab / Shift+Tab / Enter / Arrow keys:
   - Focus the "My Posts" tab trigger, press Enter.
   - Tab through the visible post cards.
   - Focus a pencil icon, press Enter → edit page loads.
   - Back, focus a trash icon, press Enter → AlertDialog opens with focus trapped inside.
   - Tab to the Delete button, press Enter → deletion completes.
3. **Expect**: every step is reachable without a mouse; focus indicators visible at all times.

### i18n: RTL (SC-006)

1. Switch locale to Arabic (`/ar/profile/...`).
2. Verify: tab label reads "منشوراتي", action button `aria-label`s are Arabic, action cluster mirrors to the correct side, AlertDialog text is Arabic, success/error toasts are Arabic.

---

## Known non-goals

- Draft visibility on the profile tab (Clarification 1: never shown).
- Infinite scroll (FR-005 explicitly rejects it).
- Modal overlay when navigating from `/profile` (R5: full-page navigation is the documented fallback).
- Adding an `isOwner` prop to the shared `PostCard` (R6: owner controls are sibling elements).
- Bookmarked posts on this tab (that's the existing "Saved Items" tab, unchanged).
