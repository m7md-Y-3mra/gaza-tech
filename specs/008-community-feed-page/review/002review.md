# Spec Review: 008-community-feed-page

- Branch: `008-community-feed-page`
- Review file: `002review.md`

## Summary

- Overall status: **FAIL**
- High-risk issues: 5 issues (1 BLOCKER, 3 HIGH, 1 MED)
- Missing tests / regression risk: No tests exist for any of these components
- Test suite results: N/A (no pytest — this is a Next.js/TypeScript project)
- Type-check: 0 errors
- Lint results: 0 errors, 10 warnings (none in community-feed module)

### User-Reported Problems Mapped to Root Causes

| User Problem                                        | Root Cause                                                              | Issue #    |
| --------------------------------------------------- | ----------------------------------------------------------------------- | ---------- |
| Search & category returns no results                | FeedList shows empty state before client-fetch can start                | Issue 1    |
| Many re-renders when switching categories           | Multiple `useCurrentUser` instances + no loading gate on filter reset   | Issue 1, 2 |
| Some posts can like, some cannot                    | Each PostCard creates its own `useCurrentUser`, N concurrent auth calls | Issue 2    |
| Share copies link to non-existent post details page | `handleShare` builds `/community/{postId}` URL, no route exists         | Issue 3    |
| Comments icon / title does nothing                  | `handleOpenComments` is a `console.log` placeholder                     | Issue 4    |

---

## Task-by-task Verification

### Task T001–T004: Setup (i18n, types, barrel)

- Status: **PASS**
- Evidence: `messages/en.json:758-786` has `CommunityFeed` namespace. `messages/ar.json` has matching keys. `modules/community/community-feed/types/index.ts` and `index.ts` barrel exist.

### Task T005: Add `search` field to `feedQuerySchema`

- Status: **PASS**
- Evidence: `modules/community/server-schema.ts:34` — `search: z.string().trim().max(200).optional()`

### Task T006: Pass `p_search` to RPC

- Status: **PASS**
- Evidence: `modules/community/queries.ts:349` — `p_search: search ?? null`

### Task T007: nuqs search-params definition

- Status: **PASS**
- Evidence: `modules/community/community-feed/search/index.ts` defines `communityFeedSearchParams` and `communityFeedSearchCache`.

### Task T008: CommunityFeedPage (SSR + FeedList)

- Status: **PARTIAL**
- Evidence: `modules/community/community-feed/CommunityFeedPage.tsx` exists. SSR initial fetch works for default filters.
- Problems: When client-side filters change, the SSR data becomes stale. The transition from SSR-data to client-fetched data has a bug (see Issue 1).

### Task T009: Route file

- Status: **PASS**
- Evidence: `app/[locale]/(main)/community/page.tsx` imports and renders `CommunityFeedPage`.

### Task T010: FeedList (useInfiniteScroll + PostCard)

- Status: **FAIL**
- Evidence: `modules/community/community-feed/components/feed-list/FeedList.tsx`
- Problems:
  1. **BLOCKER**: When filters change client-side, `initialItems` becomes `[]` (since `filtersMatchSsr` is false). The `useInfiniteScroll` reset effect sets `items = []`, `isLoading = false`, `hasMore = true`. FeedList's early return (`items.length === 0 && !isLoading && !error`) triggers immediately, showing `FeedEmptyState` and hiding the `InfiniteScrollSentinel`. Since the sentinel is hidden, `useInView` never fires `inView = true`, so `fetchNextPage` is never called. The feed is permanently stuck on the empty state.
  2. **DEBUG**: `console.log` statements on lines 31 and 67 left in production code.

### Task T011: FeedList handles filter changes

- Status: **FAIL**
- Evidence: Same as T010. Filter changes break the feed completely.

### Task T012–T014: FeedFilters (constants, hook, component)

- Status: **PASS**
- Evidence: Constants, hook, and component exist and are correctly wired. Category tabs render, search has 300ms debounce with immediate clear.

### Task T015: Wire FeedFilters into CommunityFeedPage

- Status: **PARTIAL**
- Evidence: `FeedFilters` is rendered in `CommunityFeedPage.tsx:49`. But the connection to `FeedList` is broken due to Issue 1 — filters change the URL but the feed never re-fetches.

### Task T016–T017: FeedEmptyState

- Status: **PASS**
- Evidence: `FeedEmptyState.tsx` renders icon + message + CTA. Wired into FeedList at line 70.

### Task T018–T019: CreatePostFab

- Status: **PASS**
- Evidence: `CreatePostFab.tsx` renders FAB with pen icon, hidden on `md:` breakpoint. Wired into `CommunityFeedPage.tsx:57`.

### Task T020: Navbar link

- Status: **PASS**
- Evidence: `components/layout/navbar/constants.ts:5` has `{ href: '/community', labelKey: 'community', allowedRoles: ['registered'] }`.

### Task T021: SEO metadata

- Status: **PASS**
- Evidence: `app/[locale]/(main)/community/page.tsx:5-13` has `generateMetadata` reading i18n keys.

### Task T022: Lint/type clean

- Status: **PARTIAL**
- Evidence: 0 type errors, 0 lint errors. But 2 `console.log` statements in `FeedList.tsx` should be removed.

---

## Issues List (Consolidated)

IMPORTANT: Issues are ordered by fix dependency (fix A before B if B depends on A).

### Issue 1: Filter change shows permanent empty state — feed never re-fetches (BLOCKER)

- [x] FIXED
- Severity: **BLOCKER**
- Depends on: none
- Affected tasks: T010, T011, T015 (US1, US2, US3)
- Fix notes: Updated `useInfiniteScroll` to set `isLoading = true` on filter reset and added an auto-fetch effect. Updated `FeedList` guard to check `hasMore`.
- Evidence:
  - `modules/community/community-feed/components/feed-list/FeedList.tsx:54-64` — when `filtersMatchSsr` is false, `initialItems = []` and `initialHasMore = true`
  - `hooks/use-infinite-scroll.ts:137-150` — reset effect sets `items = initialItems` (= `[]`), `isLoading = false`
  - `FeedList.tsx:68` — `items.length === 0 && !isLoading && !error` → shows `FeedEmptyState`, hides sentinel
  - `InfiniteScrollSentinel.tsx:53-60` — sentinel only rendered when `hasMore && !isLoading && !error`, but it's never reached because FeedList returns early

- Root cause analysis:
  The `useInfiniteScroll` hook correctly resets state on filter change but does NOT trigger an initial fetch for the new filters. It relies on the `InfiniteScrollSentinel` becoming visible (via `useInView`) to trigger `fetchNextPage`. But after reset, `items` is empty and `isLoading` is false, so FeedList's early return shows the empty state instead of the sentinel. The sentinel is never rendered, so no fetch ever happens.

- Proposed solution (detailed steps):

  **Option A (Recommended — fix in `useInfiniteScroll` hook):**

  In `hooks/use-infinite-scroll.ts`, modify the filter-reset effect to set `isLoading = true` when the new `initialItems` is empty and `hasMore` is true, then immediately trigger a fetch:

  ```ts
  // ── Reset on filter change ────────────────────────────────────────────────
  useEffect(() => {
    abortController.current?.abort();

    setItems(initialItems);
    page.current =
      initialItems.length > 0 ? DEFAULT_PAGE_NUMBER : DEFAULT_PAGE_NUMBER - 1;
    setHasMore(initialHasMore);
    setError(null);
    isFetching.current = false;

    // If we reset to empty but expect more data, trigger an immediate fetch
    if (initialItems.length === 0 && initialHasMore) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);
  ```

  Then add a new effect that fires the first fetch when `isLoading` is true and `items` is empty:

  ```ts
  // ── Auto-fetch when reset leaves us with empty items but hasMore ──────
  useEffect(() => {
    if (items.length === 0 && hasMore && isLoading && !isFetching.current) {
      fetchNextPage();
    }
  }, [items.length, hasMore, isLoading, fetchNextPage]);
  ```

  **Option B (Simpler — fix in `FeedList`):**

  Change the early return in `FeedList.tsx:68` to also check `hasMore`:

  ```tsx
  if (items.length === 0 && !isLoading && !error && !hasMore) {
    const hasActiveFilters = filters.category !== '' || filters.q !== '';
    return <FeedEmptyState hasActiveFilters={hasActiveFilters} />;
  }
  ```

  This ensures the sentinel is rendered when `hasMore = true`, allowing the fetch to trigger. However, this alone won't show a loading skeleton — the user will briefly see nothing until the sentinel triggers.

  **Best approach: Combine Option A + Option B** — the hook sets `isLoading = true` so a skeleton shows, AND FeedList doesn't prematurely show empty state.

- Test plan:
  1. Load `/community` — verify initial posts load
  2. Click "Questions" tab — verify posts matching "questions" category appear (not empty state)
  3. Click "All" tab — verify all posts return
  4. Type a search term in the search bar — verify matching posts appear after 300ms
  5. Clear search — verify all posts return immediately
  6. Apply category + search simultaneously — verify results satisfy both constraints
  7. Apply a filter with no matching posts — verify empty state appears (correct behavior)

- Notes / tradeoffs: Option A modifies the shared `useInfiniteScroll` hook which is used by other consumers. Verify no regressions in other infinite scroll usages.

---

### Issue 2: Each PostCard creates its own `useCurrentUser` instance — N concurrent auth calls

- [x] FIXED
- Severity: **HIGH**
- Depends on: none
- Affected tasks: T010 (PostCard rendering within FeedList)
- Fix notes: Implemented singleton pattern in `useCurrentUser` by caching the auth promise.
- Evidence:
  - `modules/community/components/post-card/hooks/usePostCard.ts:22` — `const { user, isLoading: isAuthLoading } = useCurrentUser();`
  - `hooks/use-current-user.ts:11-17` — each call creates a new Supabase client and calls `supabase.auth.getUser()`
  - `usePostCard.ts:30` — `if (isAuthLoading || likeInFlight.current) return;` silently blocks likes while loading

- Root cause analysis:
  With 10 posts on screen, 10 separate `supabase.auth.getUser()` API calls fire concurrently on mount. If any of these fail or are slow, that specific card's `isAuthLoading` remains `true`, permanently disabling like/bookmark for that card. This explains why "some posts can like and some not" — it depends on which auth calls succeed.

- Proposed solution (detailed steps):
  1. Create a `CurrentUserProvider` context at `providers/current-user-provider.tsx`:

     ```tsx
     'use client';
     import { createContext, useContext, useState, useEffect } from 'react';
     import type { User } from '@supabase/supabase-js';
     import { createClient } from '@/lib/supabase/client';

     const CurrentUserContext = createContext<{
       user: User | null;
       isLoading: boolean;
     }>({ user: null, isLoading: true });

     export function CurrentUserProvider({
       children,
     }: {
       children: React.ReactNode;
     }) {
       const [user, setUser] = useState<User | null>(null);
       const [isLoading, setIsLoading] = useState(true);

       useEffect(() => {
         const supabase = createClient();
         supabase.auth.getUser().then(({ data }) => {
           setUser(data.user);
           setIsLoading(false);
         });
       }, []);

       return (
         <CurrentUserContext value={{ user, isLoading }}>
           {children}
         </CurrentUserContext>
       );
     }

     export function useCurrentUser() {
       return useContext(CurrentUserContext);
     }
     ```

  2. Wrap `FeedList` (or the community page layout) with `<CurrentUserProvider>`.

  3. Update `usePostCard.ts` to import `useCurrentUser` from the provider instead of the hook.

  **Simpler alternative**: Make `useCurrentUser` a singleton by caching the promise:

  ```ts
  let cachedPromise: Promise<{ user: User | null }> | null = null;

  export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!cachedPromise) {
        const supabase = createClient();
        cachedPromise = supabase.auth
          .getUser()
          .then(({ data }) => ({ user: data.user }));
      }
      cachedPromise.then(({ user }) => {
        setUser(user);
        setIsLoading(false);
      });
    }, []);

    return { user, isLoading };
  }
  ```

- Test plan:
  1. Load feed with 10+ posts
  2. Open browser DevTools Network tab — verify only 1 `getUser` call (not 10)
  3. Click like on any post — verify optimistic toggle works
  4. Click like on a different post — verify it also works
  5. Scroll to load more posts — verify new cards can also like without extra auth calls

---

### Issue 3: Share copies link to non-existent post detail page

- [ ] FIXED
- Severity: **HIGH**
- Depends on: none
- Affected tasks: PostCard (from 007-post-card spec, used by 008)
- Evidence:
  - `modules/community/components/post-card/hooks/usePostCard.ts:92` — `const url = \`${window.location.origin}/community/${post.post_id}\``
  - `app/[locale]/(main)/community/` — no `[postId]/page.tsx` route exists (confirmed via Glob)

- Root cause analysis:
  `handleShare` builds a URL for a post detail page (`/community/{postId}`) that does not exist in the routing. Users who receive this shared link will get a 404.

- Proposed solution (detailed steps):

  Change `usePostCard.ts:92` to copy the current community feed URL instead of a non-existent detail URL:

  ```ts
  // OLD:
  const url = `${window.location.origin}/community/${post.post_id}`;

  // NEW:
  const url = window.location.href;
  ```

  **OR** if the intent is to link to a specific post, build a URL with a query param that can trigger the post modal:

  ```ts
  const url = `${window.location.origin}/${locale}/community?post=${post.post_id}`;
  ```

  The second approach is better UX because it deep-links to a specific post. This would require also implementing Issue 4 (post modal) to handle the `?post=` param.

- Test plan:
  1. Click share on any post
  2. Verify the toast says "Link copied"
  3. Paste the clipboard content — verify it's a valid, working URL
  4. Navigate to the pasted URL — verify it loads correctly (not 404)

---

### Issue 4: Comments icon / title click does nothing (modal not implemented)

- [x] FIXED
- Severity: **HIGH**
- Depends on: none (but Issue 3's ideal fix depends on this being implemented)
- Affected tasks: T010 (FeedList integration with PostCard)
- Fix notes: Implemented `PostDetailModal` using Radix Dialog. Integrated with `FeedList` and `useFeedFilters` for deep-linking.
- Evidence:
  - `modules/community/community-feed/components/feed-list/FeedList.tsx:73-76`:
    ```ts
    const handleOpenComments = (postId: string) => {
      console.log('Open comments for', postId);
    };
    ```
  - `PostCard.tsx:141-148` — title is a button that calls `handleOpenComments`
  - `PostCard.tsx:152-159` — content preview is a button that calls `handleOpenComments`
  - `PostCard.tsx:187-195` — comment icon button calls `handleOpenComments`

- Root cause analysis:
  The `handleOpenComments` callback is a placeholder that only logs to console. Three interactive elements (title, content, comment button) are wired to this no-op. Users click these elements and nothing happens — frustrating UX.

- Proposed solution (detailed steps):

  **This requires a new component**: a post detail modal/dialog. Suggested implementation:
  1. Create `modules/community/community-feed/components/post-detail-modal/PostDetailModal.tsx`:
     - Accept `postId: string | null` and `onClose: () => void`
     - When `postId` is truthy, render a `Dialog` (from shadcn/ui) showing the full post content
     - For V1, show full post content (title, author, content, attachments, like/bookmark/share actions)
     - Comments section can be a placeholder for now

  2. Add state to `FeedList.tsx`:

     ```tsx
     const [openPostId, setOpenPostId] = useState<string | null>(null);

     const handleOpenComments = (postId: string) => {
       setOpenPostId(postId);
     };
     ```

  3. Render the modal:

     ```tsx
     <PostDetailModal postId={openPostId} onClose={() => setOpenPostId(null)} />
     ```

  4. Add i18n keys for the modal in both `en.json` and `ar.json`.

  **Note**: This is a significant new feature. The user should confirm whether they want a full modal implementation or a simpler approach (e.g., navigate to a detail page). The user explicitly stated "modal/popup" approach.

- Test plan:
  1. Click post title — verify modal opens showing full post
  2. Click content preview — verify modal opens
  3. Click comment icon — verify modal opens
  4. Click outside modal or press Escape — verify modal closes
  5. Verify modal is accessible (focus trap, Escape to close, aria labels)

---

### Issue 5: `console.log` statements left in production code

- [x] FIXED
- Severity: **MED**
- Depends on: none
- Affected tasks: T022 (QA cleanup)
- Fix notes: Removed all debug `console.log` statements from `FeedList.tsx`.
- Evidence:
  - `modules/community/community-feed/components/feed-list/FeedList.tsx:31` — `console.log({ category, q });`
  - `modules/community/community-feed/components/feed-list/FeedList.tsx:67` — `console.log(items);`
  - `modules/community/community-feed/components/feed-list/FeedList.tsx:75` — `console.log('Open comments for', postId);`

- Root cause analysis: Debug logging left from development.

- Proposed solution: Remove all three `console.log` lines from `FeedList.tsx`.

- Test plan: `npm run lint && npm run type-check` — should still pass.

---

## Fix Plan (Ordered)

1. **Issue 1**: Filter change shows permanent empty state — modify `useInfiniteScroll` reset effect to set `isLoading = true` when resetting to empty items, and update `FeedList` early return to check `hasMore`
2. **Issue 2**: N concurrent auth calls per PostCard — create `CurrentUserProvider` context or cache the auth promise in `useCurrentUser`
3. **Issue 3**: Share copies broken URL — change `handleShare` to copy current page URL or a `?post=` deep-link URL
4. **Issue 4**: Comments/title click does nothing — implement `PostDetailModal` component and wire into `FeedList`
5. **Issue 5**: Remove `console.log` statements from `FeedList.tsx`

---

## Handoff to Coding Model (Copy/Paste)

### Files to edit/create

| Action | File                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| EDIT   | `hooks/use-infinite-scroll.ts` — add loading state on filter reset + auto-fetch effect                                              |
| EDIT   | `modules/community/community-feed/components/feed-list/FeedList.tsx` — fix empty-state guard, remove console.logs, wire modal state |
| EDIT   | `hooks/use-current-user.ts` — cache auth promise (singleton pattern) OR create new provider                                         |
| EDIT   | `modules/community/components/post-card/hooks/usePostCard.ts` — fix share URL                                                       |
| CREATE | `modules/community/community-feed/components/post-detail-modal/PostDetailModal.tsx` — post detail dialog                            |
| CREATE | `modules/community/community-feed/components/post-detail-modal/index.ts` — barrel export                                            |
| EDIT   | `messages/en.json` — add modal i18n keys                                                                                            |
| EDIT   | `messages/ar.json` — add modal i18n keys                                                                                            |

### Exact behavior changes

1. **Filtering**: Clicking a category tab or typing a search term must show a skeleton loader, then display matching posts (or empty state if truly no matches).
2. **Likes**: All post cards must be able to toggle like/bookmark. Only 1 auth call should fire regardless of how many cards are rendered.
3. **Share**: Copied URL must resolve to a working page (not 404).
4. **Comments/Title click**: Must open a modal/dialog showing the full post. Comments display can be Phase 2.

### Edge cases

- Filter change while a fetch is in-flight: abort old request, start new one (already handled by `useInfiniteScroll`)
- Empty search string after debounce: should restore full feed (already handled)
- Post detail modal while filters are active: modal should show the full post regardless of active filters
- Share URL with `?post=` param on page load: should auto-open the modal for that post

### Suggested commit breakdown

1. `fix: resolve filter reset showing permanent empty state in feed`
2. `fix: deduplicate auth calls across PostCard instances`
3. `fix: share button copies valid community feed URL`
4. `feat: add post detail modal for title/comments click`
5. `chore: remove debug console.log statements from FeedList`
