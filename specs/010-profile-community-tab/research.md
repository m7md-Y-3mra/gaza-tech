# Phase 0 Research: Profile Community Posts Tab

**Feature**: 010-profile-community-tab
**Date**: 2026-04-11
**Status**: Complete — no open NEEDS CLARIFICATION

This feature is frontend-only and reuses existing server actions and UI primitives. Research focused on reconciling the spec's clarified decisions with the concrete patterns already in use in the codebase and identifying the one small extension needed to avoid a second round-trip or a regression of the existing pagination pattern.

---

## R1. Which server action fetches a user's community posts?

**Decision**: Reuse `getUserCommunityPostsAction` from `modules/community/actions.ts`, which delegates to `getUserCommunityPostsQuery` in `modules/community/queries.ts` and ultimately calls the Supabase RPC `get_user_community_posts(p_user_id, p_page, p_limit)`.

**Rationale**: The action already exists (added in Phase 2 / feature 006). It enforces the `published` content status on the server side (verified in the RPC), which matches the spec's Clarification 1 (drafts are never surfaced). Returning to or wrapping this action in the new tab is zero-risk and keeps data-fetching centralized in the community module, honoring Principle I.

**Alternatives considered**:

- Calling Supabase directly from the profile module — rejected: duplicates query logic, violates module boundaries, and would require re-implementing the RPC wrapper.
- Creating a new profile-scoped action — rejected: unnecessary parallel abstraction; the existing action already accepts `userId`.

---

## R2. Which delete action does the owner invoke?

**Decision**: Reuse `deleteCommunityPostAction` from `modules/community/actions.ts`.

**Rationale**: The action is already `errorHandler()`-wrapped, enforces ownership on the server (soft-deletes via `content_status = 'removed'`), and calls `revalidatePath('/community', 'page')` plus `revalidatePath('/profile/${author_id}', 'page')` on success. That `revalidatePath` on the profile route is exactly what this tab needs — after a successful delete, the profile page server components (including `ProfilePostsTab`) will re-execute and return a fresh page with the deleted post absent. The client component only needs to optimistically filter the item out for the sub-second perception (SC-004) while the server revalidates.

**Alternatives considered**:

- Client-side refetch via a server action call without `revalidatePath` — rejected: fights the existing pattern and risks stale data in the parallel `/community` feed.
- Router `refresh()` on success — acceptable but unnecessary because the action already revalidates.

---

## R3. How does the profile pagination component consume the page shape?

**Decision**: Extend `getUserCommunityPostsQuery` to return a `total_count: number` field alongside its existing `has_more` / `next_page` fields. The client passes that count into the existing `ProfilePagination` component's `totalCount` prop, matching how `ProfileListingsTab` wires `listingsCount` into the same component.

**Rationale**: The existing `ProfilePagination` (`modules/user/profile/components/profile-pagination/ProfilePagination.tsx`) derives `totalPages` from `totalCount / pageSize`. It does not accept `has_more`. The only way to satisfy FR-005 ("same pagination pattern as the existing profile Listings tab") without reinventing the pagination UI is to give the query a total count. The RPC already returns all rows scoped by user id, so adding a `COUNT(*) OVER ()` window (or a parallel count query if the RPC needs changing) is a small server-side addition. Because this project's rule is "no new server-side queries beyond those already exposed" (spec Assumption), the preferred path is:

1. If the existing RPC already projects a row total, read it through and expose it.
2. Otherwise, issue a parallel `.from('community_posts').select('post_id', { count: 'exact', head: true }).eq('author_id', userId).eq('content_status', 'published')` inside `getUserCommunityPostsQuery` and bundle the count into the return value.

Either way the public signature of `getUserCommunityPostsAction` gains one field — a backwards-compatible addition. No new action is introduced.

**Alternatives considered**:

- Rebuild the pagination component to accept `has_more` — rejected: violates FR-005 and Principle I (no parallel abstractions); would diverge the listings and posts tabs.
- Use infinite scroll instead of page-based pagination — rejected: directly contradicts FR-005 ("not infinite scroll"). Already decided.
- Call a second action from the server component just to get a count — rejected: two round-trips for one list is wasteful and complicates the error path.

---

## R4. What is the canonical page size?

**Decision**: Use the constant `DEFAULT_LIMIT_NUMBER` exported from `constants/pagination.ts` (currently `4`). This is the same constant the profile Listings tab imports.

**Rationale**: Spec Clarification 3 says "10 per page, **matching the existing profile Listings tab if it already defines a size**." The existing tab already imports `DEFAULT_LIMIT_NUMBER = 4`, so the precedence clause of the clarification applies and the tab MUST match. Using the shared constant automatically keeps the two tabs in sync if the project-wide default ever changes, and satisfies Principle I ("don't duplicate shared logic"). The plain number `10` is not written into this feature's code.

**Alternatives considered**:

- Hard-code `10` in the new tab — rejected: contradicts the clarification's matching clause and creates visual asymmetry with the Listings tab.
- Introduce a separate `DEFAULT_POSTS_LIMIT` constant — rejected: premature and creates two sources of truth.

---

## R5. How does clicking a post card open the post detail modal from the profile page?

**Decision**: Reuse the existing `PostCard` component from `modules/community/components/post-card/`. Its card body already wraps in a `<Link href="/community/[postId]">` (confirmed during review). When the user navigates to `/community/[postId]` from the profile page, Next.js serves the dedicated detail page directly (full-page navigation). The intercepting route (`app/[locale]/(main)/community/@modal/(..)community/[postId]`) only intercepts when the navigation originates from within the `/community` segment's layout tree; it does NOT intercept from `/profile/[userId]`. The spec's FR-019 says "same modal pattern used by the community feed" — the modal pattern IS the intercepting-route-backed overlay, and the fallback behavior (full-page detail) is also part of that same pattern and is expected on direct navigation.

**Rationale**: Next.js intercepting routes are scoped to the segment that defines the `@modal` parallel slot. The `/community` layout has one; the `/profile/[userId]` layout does not. Two options were considered: (a) add a second `@modal` slot to the profile layout that also intercepts `/community/[postId]`, or (b) accept full-page navigation when the origin is `/profile/*`. Option (b) is the smaller, more conservative change and is already the documented fallback behavior when someone opens a shared link directly. Option (a) would require a second parallel route, a second default slot, and a second intercepting page, all of which double the surface area and risk subtle bugs without materially improving the profile UX — the profile page itself is a destination; navigating away from it to a full post page is not disorienting the way it would be from an infinite-scroll feed.

**Alternatives considered**:

- Add a parallel `@modal` slot to the profile layout (option (a)) — rejected: doubles intercepting-route surface area for a single entry point; can be added later in a follow-up without refactoring this feature.
- Implement a local modal inside the profile tab that bypasses routing entirely — rejected: creates a parallel post-detail surface, violates Principle I, and duplicates the detail UI.
- Make post cards non-interactive on the profile tab — rejected: contradicts FR-019.

**Note**: Because this decision means profile-originated post clicks result in full-page navigation, the quickstart acceptance script explicitly documents this as expected behavior and calls it out in the empty-state/owner delete flow to avoid confusion during manual testing.

---

## R6. How should the owner's Edit and Delete controls be positioned on the card?

**Decision**: Render the Edit/Delete controls as a small icon-button cluster (pencil + trash) rendered **alongside** the existing `PostCard` rather than modifying `PostCard` itself. The cluster is only mounted when `isOwner === true`. Clicks on these controls use `e.preventDefault()` + `e.stopPropagation()` to avoid triggering the card's `<Link>` navigation (FR-019 last sentence).

**Rationale**: `PostCard` is a shared component used on the feed, on home-page highlights (Phase 7), and here. Adding owner-only action slots directly inside `PostCard` would bleed profile concerns into a general-purpose component and complicate its prop surface. Rendering a sibling action cluster in the profile tab's list item preserves `PostCard` as a pure display component and keeps all owner logic co-located with the tab.

**Alternatives considered**:

- Add `isOwner`, `onEdit`, `onDelete` props directly to `PostCard` — rejected: leaks profile-specific concerns into a shared component; feed and home page would have to pass `isOwner: false` forever.
- Create a brand-new simplified "profile post card" — rejected: duplicates card layout, violates Principle I ("don't duplicate shared logic"), and would need to be kept in visual sync with `PostCard`.

---

## R7. How is the owner determined for the new tab?

**Decision**: Pass `isOwner: boolean` down from `ProfilePage.tsx` through `ProfileTabs.tsx` and into `ProfilePostsTab.tsx`, exactly the way it is already passed to `ProfileListingsTab`. No new ownership resolution logic.

**Rationale**: The profile page already computes `isOwner` once server-side by comparing the URL `userId` with the authenticated session. Every child that needs it receives it as a prop. Reusing the same channel is zero-cost and trivially testable.

**Alternatives considered**:

- Re-resolve ownership inside `ProfilePostsTab` via `auth()` — rejected: duplicates work and risks inconsistency between tabs (e.g., a stale prop vs a fresh auth call).

---

## R8. How is the "empty page after delete → previous page" behavior (FR-020) implemented?

**Decision**: After a successful delete, the client checks whether the current `page` query-param is `> 1` and the visible list has just become empty (length 0 after filtering). If so, it updates the `page` URL query param to `page - 1` using the same `nuqs`/`router.replace` mechanism the existing `ProfilePagination` already uses via `useProfilePagination`. The server component re-fetches for the new page. Page 1 is never auto-navigated.

**Rationale**: This keeps the pagination state a single source of truth (the URL). It also naturally handles the rare race where a delete happens after navigation starts: the user ends up on the previous page, which is guaranteed to have content (because the deleted item was the last on the now-empty page, meaning the previous page was full).

**Alternatives considered**:

- Keep the empty page visible and show the empty state — rejected: the spec clarification chose auto-navigate (option A) and explicitly rejected this.
- Always jump to page 1 — rejected: unnecessarily disruptive when the user is deep in their history and just pruning one post.

---

## R9. Delete UX: optimistic update + transition

**Decision**: Mirror `ProfileListingsTabClient` exactly — use `useOptimistic` for immediate list removal and `useTransition` for the `isPending` guard that disables the Delete button while in flight (FR-018). On failure, show a `sonner` toast with the error message; on success, show a translated success toast.

**Rationale**: Identical delete UX keeps muscle memory across tabs, reuses a battle-tested pattern, and satisfies SC-004 ("deleted post disappears within 1 second"). It also automatically handles rapid repeated Delete clicks (FR-018) because `isPending` gates the button.

**Alternatives considered**:

- Non-optimistic delete with a full server refetch — rejected: slower perception; fails SC-004.

---

## R10. i18n keys to add

**Decision**: New `Profile.Tabs.myPosts` (tab trigger) and `Profile.PostsTab.*` (tab body: `emptyTitle`, `emptyDescription`, `createFirstPost`, `errorTitle`, `errorDescription`, `edit`, `delete`, `deleteConfirmTitle`, `deleteConfirmMessage`, `deleteConfirmAction`, `deleteCancel`, `deleteSuccess`, `deleteError`). Add to both `messages/en.json` and `messages/ar.json` as part of the final polish commit. This matches Phase 8's registry in CHAT.md (which lists `Profile.Tabs.myPosts`) and extends it with the minimum additional keys the tab body needs.

**Rationale**: Colocated under the existing `Profile` namespace keeps the profile-scoped translations together (a `Profile.ListingsTab.*` block already exists for the Listings tab). All strings required by FR-012, FR-013, FR-014, FR-015, FR-016 have a matching key. RTL mirroring is handled by Tailwind's `ltr:` / `rtl:` variants already present in the existing profile-tab components, not by new CSS.

**Alternatives considered**:

- Top-level `PostsTab.*` namespace — rejected: diverges from how the other two profile tabs are named and namespaced.

---

## Summary

All NEEDS CLARIFICATION markers are resolved (there were none after the clarify session). All decisions align with the Constitution's principles and the spec's Functional Requirements. The only non-trivial server-side touch is R3 (adding `total_count` to the query return), which is a minimal, backwards-compatible extension driven directly by FR-005's "same pagination pattern" requirement.
