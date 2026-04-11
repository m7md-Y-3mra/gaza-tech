# Tasks: Profile Community Posts Tab

**Input**: Design documents from `/specs/010-profile-community-tab/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md, quickstart.md

**Tests**: NOT requested. No automated test tasks are generated — acceptance is manual per `quickstart.md`.

**Organization**: Tasks are grouped by user story (US1 → US4) so each can be implemented and verified independently.

**How to use this file**: Every task is written so a cheaper coding LLM (e.g. Gemini CLI) can execute it without additional context. Every task lists:

- the **exact file path** to touch,
- a **"Mirror"** pointer to an existing sibling file to copy and rename,
- the **exact symbols / imports / snippets** to add,
- the **"Done when"** acceptance criteria.

If any task says "mirror file X", the LLM should open X, duplicate it verbatim, then apply the listed renames. Do not invent new patterns — this feature is a 1:1 clone of the existing `profile-listings-tab` folder with `listing`/`Listing` swapped for `post`/`Post`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks (different files, no cross-task dependencies)
- **[Story]**: `[US1]`, `[US2]`, `[US3]`, `[US4]` — maps to user stories in `spec.md`
- Paths are absolute from repo root (`/home/m7md/a/gaza-tech/front-end-agy/`)

## Path Conventions (this feature only)

- **Existing (reference, read-only)**:
  - `modules/user/profile/components/profile-tabs/profile-listings-tab/` — the canonical sibling to mirror
  - `modules/community/actions.ts` — `getUserCommunityPostsAction`, `deleteCommunityPostAction`
  - `modules/community/queries.ts` — `getUserCommunityPostsQuery`
  - `modules/community/components/post-card/PostCard.tsx` — shared card component
  - `modules/user/profile/components/profile-pagination/ProfilePagination.tsx` — reused pagination
  - `constants/pagination.ts` — exports `DEFAULT_LIMIT_NUMBER`
- **New (this feature creates)**: all under `modules/user/profile/components/profile-tabs/profile-posts-tab/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: None. This is a frontend-only feature; no project initialization, no new dependencies, no new tooling.

_(Phase 1 intentionally empty — proceed directly to Phase 2.)_

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the query return shape and scaffold the new module folder. No user-visible behavior yet. After this phase, all four user stories can proceed in parallel.

**⚠️ CRITICAL**: US1/US2/US3/US4 all import from files created in this phase. Do not start Phase 3 until Phase 2 is done.

- [x] T001 Extend the shared page type in `modules/community/types/index.ts` to add a new exported type alias `PageWithCount<T>`.
  - **Mirror**: look at the existing `Page<T>` type already exported from this file. Add immediately after it:
    ```ts
    export type PageWithCount<T> = Page<T> & {
      total_count: number;
    };
    ```
  - **Done when**: `PageWithCount<T>` is exported and `npm run type-check` still passes.

- [x] T002 Update `getUserCommunityPostsQuery` in `modules/community/queries.ts` so it returns `PageWithCount<FeedPost>` instead of `Page<FeedPost>`.
  - **Context**: the existing function already fetches rows via the Supabase RPC `get_user_community_posts(p_user_id, p_page, p_limit)` and returns `{ data, has_more, next_page }`. We need to add `total_count` to that return value.
  - **Implementation**: in the same function, after fetching the RPC result, issue a parallel Supabase count query:
    ```ts
    const { count } = await supabase
      .from('community_posts')
      .select('post_id', { count: 'exact', head: true })
      .eq('author_id', input.user_id)
      .eq('content_status', 'published');
    ```
    Then return `{ data, has_more, next_page, total_count: count ?? 0 }`.
  - **Imports**: add `PageWithCount` to the existing import from `./types`.
  - **Signature change**: update the return type annotation from `Promise<Page<FeedPost>>` to `Promise<PageWithCount<FeedPost>>`.
  - **Do NOT**: create a new action, new RPC, or new wrapper. Only edit this function in place.
  - **Done when**: `npm run type-check` passes AND `getUserCommunityPostsAction` in `modules/community/actions.ts` automatically picks up the new field (it already delegates via `errorHandler(getUserCommunityPostsQuery)` — no edit needed there).

- [x] T003 [P] Create the barrel file `modules/user/profile/components/profile-tabs/profile-posts-tab/index.ts` exporting every component that later tasks will add.
  - **Contents** (it is fine to export names that do not exist yet — later tasks create the files):
    ```ts
    export { ProfilePostsTab } from './ProfilePostsTab';
    export { ProfilePostsTabClient } from './ProfilePostsTabClient';
    export { ProfilePostsTabSkeleton } from './ProfilePostsTabSkeleton';
    export { ProfilePostsTabError } from './ProfilePostsTabError';
    export type {
      ProfilePostsTabProps,
      ProfilePostsTabClientProps,
    } from './types';
    ```
  - **Done when**: file exists. Do not run type-check yet — later tasks populate the referenced modules.

- [x] T004 [P] Create `modules/user/profile/components/profile-tabs/profile-posts-tab/types/index.ts` with the prop shapes from `data-model.md`.
  - **Contents**:

    ```ts
    import type { ReactNode } from 'react';
    import type { FeedPost } from '@/modules/community/types';

    export type ProfilePostsTabProps = {
      userId: string;
      page: number;
      isOwner: boolean;
    };

    export type ProfilePostsTabClientProps = {
      posts: FeedPost[];
      postsCount: number;
      pageSize: number;
      isOwner: boolean;
    };
    ```

  - **Done when**: file exists and both types are exported.

- [x] T005 [P] Create `modules/user/profile/components/profile-tabs/profile-posts-tab/ProfilePostsTabSkeleton.tsx` as a loading placeholder.
  - **Mirror**: copy `modules/user/profile/components/profile-tabs/profile-listings-tab/ProfileListingsTabSkeleton.tsx` verbatim, then rename the exported component from `ProfileListingsTabSkeleton` to `ProfilePostsTabSkeleton`. Keep the same skeleton item count (it should render `DEFAULT_LIMIT_NUMBER` placeholder cards).
  - **Done when**: file exists, component is exported, uses existing shadcn/ui `<Skeleton>` primitive (same as the mirrored file).

- [x] T006 [P] Create `modules/user/profile/components/profile-tabs/profile-posts-tab/ProfilePostsTabError.tsx` as the `react-error-boundary` fallback.
  - **Mirror**: copy `modules/user/profile/components/profile-tabs/profile-listings-tab/ProfileListingsTabError.tsx` verbatim.
  - **Renames**: component name → `ProfilePostsTabError`; any user-facing translation keys of the form `Profile.ListingsTab.errorTitle` / `errorDescription` → `Profile.PostsTab.errorTitle` / `Profile.PostsTab.errorDescription` (these i18n keys are added in T021/T022).
  - **Done when**: file exists; component accepts `{ error, resetErrorBoundary }` props (FallbackProps from `react-error-boundary`) exactly like the mirrored file.

- [x] T007 Create `modules/user/profile/components/profile-tabs/profile-posts-tab/ProfilePostsTab.tsx` as the **server component** shell.
  - **Depends on**: T002 (for the new `total_count` field), T004 (types), T005 (skeleton for Suspense), T006 (error for the boundary).
  - **Mirror**: `modules/user/profile/components/profile-tabs/profile-listings-tab/ProfileListingsTab.tsx`. Copy it, then apply these renames:
    - component name: `ProfileListingsTab` → `ProfilePostsTab`
    - action import: `getUserListingsAction` → `getUserCommunityPostsAction` from `@/modules/community/actions`
    - action input shape: `{ user_id, page, limit }` (already the same)
    - result access: where the listings version reads `result.data.data` / `result.data.total_count` / pass-through to its client, do the same here into `ProfilePostsTabClient`
    - client import: `ProfileListingsTabClient` → `ProfilePostsTabClient`
    - props type: `ProfilePostsTabProps` from `./types`
  - **Snippet sketch** (final shape must match the mirrored file's structure, not this sketch verbatim):

    ```tsx
    import { getUserCommunityPostsAction } from '@/modules/community/actions';
    import { DEFAULT_LIMIT_NUMBER } from '@/constants/pagination';
    import { ProfilePostsTabClient } from './ProfilePostsTabClient';
    import type { ProfilePostsTabProps } from './types';

    export async function ProfilePostsTab({
      userId,
      page,
      isOwner,
    }: ProfilePostsTabProps) {
      const result = await getUserCommunityPostsAction({
        user_id: userId,
        page,
        limit: DEFAULT_LIMIT_NUMBER,
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch community posts');
      }

      return (
        <ProfilePostsTabClient
          posts={result.data.data}
          postsCount={result.data.total_count}
          pageSize={DEFAULT_LIMIT_NUMBER}
          isOwner={isOwner}
        />
      );
    }
    ```

  - **Done when**: file exists, exports `ProfilePostsTab`, and throwing on failure is wired so the `ErrorBoundary` in `ProfileTabs.tsx` (added in T010) can catch it.

**Checkpoint**: Phase 2 complete. The `profile-posts-tab/` folder exists with server shell, skeleton, error, and types. The query returns `total_count`. No UI is visible yet — `ProfilePostsTabClient` is still missing, so US1 must create it before the tab is usable.

---

## Phase 3: User Story 1 - View a user's community posts (Priority: P1) 🎯 MVP

**Goal**: Any visitor (signed in or signed out) can click the new "My Posts" tab on a user profile and see that user's published community posts on page 1, in reverse chronological order, with the correct metadata (title, category, preview, date, like count, comment count). Empty state renders when the user has zero posts.

**Independent Test**: per `quickstart.md` → "US1 — View a user's community posts" section. Visit the profile of a user with ≥1 published post signed out; confirm the tab exists and lists posts. Visit an empty profile; confirm the text-only empty state (no CTA yet — CTA is added in T019 of Polish phase).

- [x] T008 [US1] Create `modules/user/profile/components/profile-tabs/profile-posts-tab/ProfilePostsTabClient.tsx` as the **client component** that renders the list.
  - **Declaration**: the file MUST start with `'use client';`.
  - **Mirror**: `modules/user/profile/components/profile-tabs/profile-listings-tab/ProfileListingsTabClient.tsx`. Copy it, then apply these renames and removals:
    - component name: `ProfileListingsTabClient` → `ProfilePostsTabClient`
    - props type: `ProfilePostsTabClientProps` from `./types`
    - prop names: `listings` → `posts`, `listingsCount` → `postsCount` (keep `pageSize`, `isOwner`)
    - list item component: replace the listings card with `<PostCard post={post} />` imported from `@/modules/community/components/post-card`
    - FOR NOW (US1 only): temporarily remove any Edit/Delete action cluster logic. Keep only the list + `ProfilePagination`. US2/US3 will add the owner actions back in T012/T014.
    - Remove `useOptimistic` / `useTransition` imports for now; they return in T014.
  - **Empty state**: when `posts.length === 0`, render the text-only empty state using existing translation keys `Profile.PostsTab.emptyTitle` and `Profile.PostsTab.emptyDescription` (keys are added in T021 — use the literal strings `'Profile.PostsTab.emptyTitle'` etc. now; the `next-intl` fallback will surface the key name until T021 merges, which is acceptable within US1 because T021 is part of Polish phase).
  - **Pagination**: render `<ProfilePagination totalCount={postsCount} pageSize={pageSize} />` below the list (import from `@/modules/user/profile/components/profile-pagination`). The component already reads the page param from the URL via `nuqs` — no extra wiring needed.
  - **Done when**: component compiles, renders a list of `PostCard` for non-empty input, renders the empty state for empty input, and accepts `isOwner` (even though US1 does not use it yet — US2/US3 will).

- [x] T009 [US1] Extend `modules/user/profile/components/profile-tabs/types/index.ts` by adding one new field to `ProfileTabsClientProps`.
  - Existing type currently has (roughly):
    ```ts
    export type ProfileTabsClientProps = {
      isOwner: boolean;
      listingsContent: ReactNode;
      bookmarkedContent: ReactNode;
    };
    ```
  - Add one field: `postsContent: ReactNode;` (not optional — FR-002 says the tab is visible to every viewer).
  - **Done when**: type exports the new field and `npm run type-check` passes once T010 and T011 land.

- [x] T010 [US1] Update `modules/user/profile/components/profile-tabs/ProfileTabs.tsx` (server component) to compose the new `ProfilePostsTab` inside a `Suspense` + `ErrorBoundary` and pass it to `ProfileTabsClient` via the new `postsContent` prop.
  - **Mirror**: look at how the existing `listingsContent` is assembled in this same file — specifically the `<ErrorBoundary FallbackComponent={ProfileListingsTabError}><Suspense fallback={<ProfileListingsTabSkeleton />}><ProfileListingsTab ... /></Suspense></ErrorBoundary>` block. Duplicate that block immediately next to it, for the posts tab, using:
    - `ProfilePostsTabError` (from `./profile-posts-tab`)
    - `ProfilePostsTabSkeleton` (same import)
    - `ProfilePostsTab` (same import)
    - Props: `userId={userId}`, `page={page}`, `isOwner={isOwner}` (these values are already in scope in this file because the listings tab uses them identically)
  - Pass the assembled element to the client as `postsContent={postsElement}`.
  - **Imports to add**: `import { ProfilePostsTab, ProfilePostsTabSkeleton, ProfilePostsTabError } from './profile-posts-tab';`
  - **Done when**: the element is built and passed through as a prop.

- [x] T011 [US1] Update `modules/user/profile/components/profile-tabs/ProfileTabsClient.tsx` to render a new `TabsTrigger` and `TabsContent` for the My Posts tab.
  - **Mirror**: the existing `listings` tab trigger and content in this file.
  - **Add a new `TabsTrigger`** with `value="posts"` and visible label `t('Profile.Tabs.myPosts')` (use the existing `useTranslations` hook at the top of this file). Place it between the `listings` trigger and the owner-gated `bookmarked` trigger so the visible order is: "My Listings", "My Posts", "Saved Items".
  - **Add a new `TabsContent`** with `value="posts"` whose child is `{postsContent}` (from the new prop added in T009).
  - **Do NOT** gate the posts trigger or content on `isOwner` — FR-002 requires visibility to all viewers.
  - The posts tab `TabsTrigger` is always mounted regardless of `isOwner`.
  - **Done when**: the tab trigger is visible to everyone; clicking it renders the `postsContent` subtree.

- [x] T012 [US1] Update `modules/user/profile/ProfilePage.tsx` to pass through any data the posts tab needs via `ProfileTabs`.
  - **Check first**: `ProfileTabs` already receives `userId`, `page`, `isOwner` for the listings tab. If `ProfilePage` already passes all three, this task is a no-op — mark it complete and move on.
  - **If a `page` prop is not yet passed**: add it by reading the page URL param via the existing `nuqs` profile page cache (already used by the listings tab; import it from the same `useProfilePagination` / `profilePaginationCache` location used there) and pass it down.
  - **Done when**: `ProfileTabs` has everything it needs to render the posts tab with the correct page.

**Checkpoint**: US1 is complete. Any visitor can open any profile, click "My Posts", and see the first page of that user's published posts. Empty state shows text only. No owner controls yet. No pagination navigation beyond the URL-param page load.

---

## Phase 4: User Story 2 - Owner edits one of their community posts (Priority: P2)

**Goal**: When the signed-in viewer IS the profile owner, each post card in the "My Posts" tab shows an Edit (pencil) icon. Clicking it navigates to `/community/[postId]/edit`. For any other viewer, no Edit icon is rendered.

**Independent Test**: per `quickstart.md` → "US2 — Owner edits a post". Sign in as the owner, open "My Posts", click pencil → lands on the edit screen. Sign in as a different user → no pencil is shown.

- [x] T013 [US2] In `modules/user/profile/components/profile-tabs/profile-posts-tab/ProfilePostsTabClient.tsx`, add an owner-only Edit control rendered alongside each `PostCard`.
  - **Pattern (from research R6)**: the Edit/Delete controls are SIBLINGS of `PostCard`, not props passed into `PostCard`. Wrap each list item like:
    ```tsx
    <div className="relative">
      <PostCard post={post} />
      {isOwner && (
        <div className="absolute end-2 top-2 flex gap-1">
          <Link
            href={`/community/${post.post_id}/edit`}
            aria-label={t('edit')}
            className="..." // same icon-button classes as ProfileListingsTabClient's edit link
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="size-4" />
          </Link>
          {/* delete button added in T014 */}
        </div>
      )}
    </div>
    ```
  - **Imports**: `Link` from `next/link`, `Pencil` from `lucide-react`, `useTranslations` from `next-intl` (scope `Profile.PostsTab`).
  - **RTL**: use logical properties (`end-2`, not `right-2`) so Arabic mirrors correctly.
  - **Translation key**: `t('edit')` resolves to `Profile.PostsTab.edit` (added in T021).
  - **Done when**: owner sees a pencil icon on every card linking to `/community/<post_id>/edit`; non-owners see no pencil.

**Checkpoint**: US2 is complete. Owners have a working Edit entry point. Verify with the `quickstart.md` US2 acceptance script.

---

## Phase 5: User Story 3 - Owner deletes one of their community posts (Priority: P2)

**Goal**: The owner can click a trash icon on a post card, confirm the deletion in a modal `AlertDialog`, and the post is removed from the list. The button is disabled while a delete is in flight (FR-018). On success, a success toast appears. On failure, the optimistic removal is reverted and an error toast is shown. If the deletion empties the current page and `page > 1`, the URL page param decrements by 1 (FR-020).

**Independent Test**: per `quickstart.md` → "US3 — Owner deletes a post". Exercise cancel, confirm, rapid clicks, and the empty-page-after-delete edge case.

- [x] T014 [US3] Back in `modules/user/profile/components/profile-tabs/profile-posts-tab/ProfilePostsTabClient.tsx`, add the Delete control + `AlertDialog` + optimistic-removal + transition-gated handler.
  - **Mirror delete behavior**: `modules/user/profile/components/profile-tabs/profile-listings-tab/ProfileListingsTabClient.tsx` already implements the canonical delete flow using `useOptimistic` + `useTransition` + `AlertDialog` + `sonner`. Copy its handler structure verbatim, then adapt:
    - action import: `deleteCommunityPostAction` from `@/modules/community/actions`
    - action input shape: `{ post_id: postId }` (single field)
    - state: `const [optimisticPosts, removeOptimisticPost] = useOptimistic(posts, (current, postId: string) => current.filter((p) => p.post_id !== postId));`
    - transition: `const [isPending, startTransition] = useTransition();`
    - pending-delete tracking: `const [deletingId, setDeletingId] = useState<string | null>(null);`
    - handler:
      ```ts
      const handleDelete = (postId: string) => {
        setDeletingId(postId);
        startTransition(async () => {
          removeOptimisticPost(postId);
          const result = await deleteCommunityPostAction({ post_id: postId });
          if (!result.success) {
            toast.error(result.message || t('deleteError'));
          } else {
            toast.success(t('deleteSuccess'));
            // FR-020: if this delete left the current page empty AND page > 1, step back one page.
            const remaining = optimisticPosts.length - 1;
            if (remaining <= 0 && currentPage > 1) {
              setPage(currentPage - 1); // via the nuqs/useProfilePagination setter used by ProfilePagination
            }
          }
          setDeletingId(null);
        });
      };
      ```
  - **Button gating**: the trash button MUST be `disabled={isPending && deletingId === post.post_id}` so rapid repeated clicks on the same post are ignored (FR-018).
  - **AlertDialog markup** (shadcn/ui `AlertDialog`): title = `t('deleteConfirmTitle')`, description = `t('deleteConfirmMessage')`, cancel = `t('deleteCancel')`, confirm = `t('deleteConfirmAction')`. Mirror the AlertDialog JSX from `ProfileListingsTabClient.tsx` exactly — only swap the translation namespace from `Profile.ListingsTab` to `Profile.PostsTab` and the handler to `handleDelete`.
  - **Imports to add**: `useOptimistic`, `useState`, `useTransition` from `react`; `toast` from `sonner`; `Trash2` from `lucide-react`; `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogTrigger` from `@/components/ui/alert-dialog`; `deleteCommunityPostAction` from `@/modules/community/actions`.
  - **Page param**: read `currentPage` and `setPage` from the same `useProfilePagination` (or equivalent `nuqs` cache) the pagination component uses. Do NOT spin up a second `nuqs` instance — reuse the existing hook.
  - **List rendering**: render over `optimisticPosts` instead of `posts`.
  - **stopPropagation**: the trash `AlertDialogTrigger` must call `e.stopPropagation()` so clicks do not also trigger the `PostCard`'s link navigation (FR-019 last sentence).
  - **Done when**: delete flow matches acceptance scenarios in `spec.md` § User Story 3 and edge cases in `quickstart.md`.

**Checkpoint**: US3 is complete. Owners can delete posts with confirmation, optimistic removal, and FR-020 auto page-back.

---

## Phase 6: User Story 4 - Paginate through a long post history (Priority: P3)

**Goal**: When a profile owner has more than `DEFAULT_LIMIT_NUMBER` published posts, the viewer can move between pages using the existing `ProfilePagination` component, and the current page is reflected in the URL so it is shareable and restored on reload.

**Independent Test**: per `quickstart.md` → "US4 — Paginate". Open `/profile/<ownerId>?page=2`, verify page 2 renders; click next/previous, verify URL updates.

**Note**: The `<ProfilePagination>` component and URL param handling were wired in T008 as part of US1 because they share the same file. The only thing US4 requires beyond US1 is confirming behavior — there is one small task to cover edge cases not exercised by US1.

- [x] T015 [US4] Sanity-verify pagination in `ProfilePostsTabClient.tsx` by confirming the following without adding new state:
  - `<ProfilePagination>` is rendered only when `postsCount > pageSize`. If the current client renders it unconditionally, wrap it in `{postsCount > pageSize && <ProfilePagination ... />}`. Mirror how `ProfileListingsTabClient.tsx` handles the same check.
  - The `totalCount` and `pageSize` props come from `postsCount` and `pageSize` respectively (already done in T008).
  - The pagination component already reads/writes the URL `page` param via `nuqs`; no extra wiring needed.
  - **Done when**: on a profile with > `DEFAULT_LIMIT_NUMBER` posts, the pagination bar appears; on a profile with ≤ `DEFAULT_LIMIT_NUMBER`, it is hidden.

**Checkpoint**: US4 is complete. All four user stories are now independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: i18n, empty-state CTA, accessibility polish, and final validation. These tasks affect multiple user stories but introduce no new behavior on their own.

- [x] T016 In `modules/user/profile/components/profile-tabs/profile-posts-tab/ProfilePostsTabClient.tsx`, upgrade the empty state so the **owner** additionally sees a "Create your first post" CTA linking to the create-post flow (FR-014).
  - Inside the `posts.length === 0` branch, render:
    ```tsx
    <div className="...">
      <p className="...">{t('emptyTitle')}</p>
      <p className="...">{t('emptyDescription')}</p>
      {isOwner && (
        <Link href="/community/create" className="...">
          {t('createFirstPost')}
        </Link>
      )}
    </div>
    ```
  - **Styling**: mirror the empty-state container classes and typography from `ProfileListingsTabClient.tsx` so the two tabs look identical.
  - **Done when**: owner sees the CTA on their own empty profile; any other viewer sees only text.

- [x] T017 [P] Add the English translation keys to `messages/en.json` under the existing `Profile` namespace.
  - **Add `Profile.Tabs.myPosts`**: `"My Posts"` (goes inside the existing `Profile.Tabs` sub-object next to `myListings` / `bookmarks`).
  - **Add the full `Profile.PostsTab` block** (parallel to the existing `Profile.ListingsTab` block):
    ```json
    "PostsTab": {
      "emptyTitle": "No posts yet",
      "emptyDescription": "This user has not published any community posts.",
      "createFirstPost": "Create your first post",
      "errorTitle": "Couldn't load posts",
      "errorDescription": "Something went wrong while loading community posts. Please try again.",
      "edit": "Edit post",
      "delete": "Delete post",
      "deleteConfirmTitle": "Delete this post?",
      "deleteConfirmMessage": "This action cannot be undone. The post will be removed from the community feed and from your profile.",
      "deleteConfirmAction": "Delete",
      "deleteCancel": "Cancel",
      "deleteSuccess": "Post deleted.",
      "deleteError": "Couldn't delete the post. Please try again."
    }
    ```
  - **Done when**: both additions are present, JSON is valid, and `npm run check-format` passes.

- [x] T018 [P] Add the Arabic translations to `messages/ar.json` with the same keys as T017.
  - **Add `Profile.Tabs.myPosts`**: `"منشوراتي"`.
  - **Add the full `Profile.PostsTab` block** with Arabic copy mirroring the English:
    ```json
    "PostsTab": {
      "emptyTitle": "لا توجد منشورات بعد",
      "emptyDescription": "لم ينشر هذا المستخدم أي منشورات في المجتمع بعد.",
      "createFirstPost": "أنشئ أول منشور لك",
      "errorTitle": "تعذّر تحميل المنشورات",
      "errorDescription": "حدث خطأ أثناء تحميل منشورات المجتمع. يرجى المحاولة مرة أخرى.",
      "edit": "تعديل المنشور",
      "delete": "حذف المنشور",
      "deleteConfirmTitle": "هل تريد حذف هذا المنشور؟",
      "deleteConfirmMessage": "لا يمكن التراجع عن هذا الإجراء. سيُزال المنشور من خلاصة المجتمع ومن ملفك الشخصي.",
      "deleteConfirmAction": "حذف",
      "deleteCancel": "إلغاء",
      "deleteSuccess": "تم حذف المنشور.",
      "deleteError": "تعذّر حذف المنشور. يرجى المحاولة مرة أخرى."
    }
    ```
  - **Done when**: both additions are present, JSON is valid, `npm run check-format` passes, and no key in `en.json` is missing from `ar.json`.

- [x] T019 Accessibility audit pass on `ProfilePostsTabClient.tsx`:
  - Every `<Link>` and `<button>` control has a translated `aria-label`.
  - The pencil Edit link uses `<Link>` (a real anchor), not a div with onClick.
  - The trash Delete button uses `<button>` with `type="button"`.
  - Focus indicators visible (rely on existing Tailwind `focus-visible:` classes from the shared primitives — do not remove them).
  - Tab order runs card → pencil → trash → next card (no negative `tabIndex`).
  - **Done when**: `quickstart.md` § "A11y: keyboard-only flow" passes for owner and non-owner.

- [x] T020 Final validation: run the full `quickstart.md` manual acceptance script end-to-end.
  - Run: `npm run dev`, then step through every section in `quickstart.md` (US1, US2, US3, US4, edge cases, a11y, RTL).
  - Run: `npm run check` (format + lint + type-check) — must pass with zero errors.
  - **Done when**: every acceptance scenario in `spec.md` passes AND `npm run check` is green AND no strings in the tab UI are untranslated (verify by toggling `/en/` vs `/ar/` on a profile).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: empty, skip.
- **Phase 2 (Foundational)**: T001 → T002 (sequential, same module). T003/T004/T005/T006 are [P] and may run in parallel after T004 exists for typing. T007 depends on T002, T004, T005, T006.
- **Phase 3 (US1)**: depends on Phase 2. T008 → T009 → T010 → T011 → T012 (mostly sequential because they build up the composition chain).
- **Phase 4 (US2)**: depends on Phase 3 (needs the client from T008). T013 only.
- **Phase 5 (US3)**: depends on Phase 3 (needs the client from T008). T014 only. Independent of Phase 4 but both edit the same file, so schedule one after the other.
- **Phase 6 (US4)**: depends on Phase 3. T015 only.
- **Phase 7 (Polish)**: T016 depends on T008. T017/T018 are [P] with each other and may run in parallel with T013/T014/T015/T016. T019 depends on T013+T014. T020 depends on everything.

### User Story Dependencies

- **US1 (P1)**: foundational only. Independently testable as soon as T012 lands.
- **US2 (P2)**: depends on US1 (needs the client component). Independently testable — verify pencil only for owner.
- **US3 (P2)**: depends on US1. Parallel-independent of US2 in behavior, but T013 and T014 edit the same file, so execute T013 first, then T014.
- **US4 (P3)**: depends on US1. T008 already wires pagination, so US4 is effectively a verification pass (T015).

### Parallel Opportunities

- Within Phase 2: T003, T004, T005, T006 are all `[P]` (different files, no cross-dependencies after T004 provides the types).
- Within Phase 7: T017 and T018 are `[P]` (different locale files).
- Across phases (if two developers): one can take US2 (T013) while another takes US3 (T014), provided they serialize writes to `ProfilePostsTabClient.tsx`.

---

## Parallel Example: Phase 2 Scaffolding

```bash
# After T001 + T002 are committed, these four tasks can run in parallel:
Task: "T003 Create profile-posts-tab/index.ts barrel"
Task: "T004 Create profile-posts-tab/types/index.ts with ProfilePostsTabProps and ProfilePostsTabClientProps"
Task: "T005 Create profile-posts-tab/ProfilePostsTabSkeleton.tsx mirroring ProfileListingsTabSkeleton"
Task: "T006 Create profile-posts-tab/ProfilePostsTabError.tsx mirroring ProfileListingsTabError"
```

## Parallel Example: i18n

```bash
# T017 and T018 touch different files and have no ordering constraint:
Task: "T017 Add Profile.Tabs.myPosts + Profile.PostsTab.* to messages/en.json"
Task: "T018 Add Profile.Tabs.myPosts + Profile.PostsTab.* to messages/ar.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 2: T001 → T002 → T003–T006 (parallel) → T007.
2. Phase 3: T008 → T009 → T010 → T011 → T012.
3. **STOP and VALIDATE**: run `quickstart.md` § US1. A non-owner viewer can see a user's posts. The MVP is shippable.
4. Decide whether to continue to US2/US3/US4 or ship US1 alone.

### Incremental Delivery (recommended, matches staged commits in `quickstart.md`)

1. Ship Stage 1 = T001 + T002 (commit: `feat(community): return total_count from getUserCommunityPostsQuery for profile pagination`).
2. Ship Stage 2 = T003–T007 (commit: `feat(profile): add profile posts tab server shell, skeleton, and error boundary`).
3. Ship Stage 3 = T008–T012 + T015 (commit: `feat(profile): render user community posts in profile posts tab with pagination`) → US1 + US4 live.
4. Ship Stage 4 = T013 + T014 (commit: `feat(profile): add edit and delete actions on owner's community posts tab`) → US2 + US3 live.
5. Ship Stage 5 = T016 (commit: `feat(profile): show empty state with create-first-post CTA for owner`).
6. Ship Stage 6 = T017 + T018 + T019 (commit: `feat(profile): add translations and accessibility polish for community posts tab`).
7. Run T020 as a pre-merge gate.

Stop and request explicit approval between each stage per CLAUDE.md § 7 "Approval & Commit Workflow".

---

## Notes

- **No new server actions, no new DB queries, no new routes.** The only server-side edit is T002 (extending one existing query's return shape). Everything else is UI wiring.
- **All new UI lives under `modules/user/profile/components/profile-tabs/profile-posts-tab/`** — do not add files anywhere else under `modules/user/profile/` or `modules/community/`.
- **Do not modify `PostCard`** to add owner props. Research decision R6: owner controls are sibling elements, not `PostCard` props. This keeps `PostCard` reusable on the feed and home page.
- **Do not add a `@modal` slot to the profile layout.** Research decision R5: clicking a post from the profile does a full-page navigation to `/community/[postId]`; this is the documented fallback of the modal pattern and is expected. Do not try to "fix" it.
- **Do not hardcode the page size to 10.** Research decision R4: use `DEFAULT_LIMIT_NUMBER` from `constants/pagination.ts`, which currently resolves to `4`. The spec's "10 per page" clarification explicitly defers to the existing profile page size.
- **Commit granularity**: one commit per stage above. Do not bundle stages into a single commit.
- **If any `npm run type-check` error appears after T007 but before T008**: that is expected — `ProfilePostsTabClient` does not exist yet. Continue to T008 and the error resolves.
- **Do not skip the `stopPropagation` calls** on Edit/Delete controls — without them, clicks on icons also trigger the `PostCard`'s `<Link>` navigation, silently breaking FR-019.
