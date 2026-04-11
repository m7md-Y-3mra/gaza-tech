# Community Feeds Page — Spec Kit Implementation Plan

## Context

**Goal:** Build the community feeds page with all interactive features (infinite scroll, likes, bookmarks, comments, share, profile integration, and home page connection).

**Stack:** Next.js 16, React 19, Supabase, react-hook-form + zod v4, next-intl, Tailwind CSS 4, shadcn/ui (radix), sonner, lucide-react, react-intersection-observer, nuqs.

**What Already Exists:**

- `modules/community/` — create/update post form, actions, queries, types, schema (all implemented)
- `app/[locale]/(main)/community/create/page.tsx` and `community/[postId]/edit/page.tsx` routes
- `components/file-upload/` — shared reusable upload component (already extracted)
- Listings infinite scroll in `modules/listings/home/components/load-more/LoadMore.tsx`
- Bookmark optimistic update pattern in `modules/listings/.../bookmark-status/hooks/useBookmarkStatus.ts`
- Profile tabs in `modules/user/profile/components/profile-tabs/`

**What Doesn't Exist Yet:**

- Community feed page (`app/[locale]/(main)/community/page.tsx`)
- Post card component
- Like/Bookmark/Share/Comment functionality for posts
- Post detail modal with comments
- Shared infinite scroll hook
- Community posts in profile
- Home page with mixed content

---

## Database Schema Reference (from Supabase)

### `community_posts`

| Column           | Type            | Default              | Check                                          |
| ---------------- | --------------- | -------------------- | ---------------------------------------------- |
| `post_id`        | uuid PK         | `uuid_generate_v4()` | —                                              |
| `author_id`      | uuid FK → users | —                    | —                                              |
| `title`          | text            | —                    | —                                              |
| `content`        | text            | —                    | —                                              |
| `post_category`  | text            | `'questions'`        | `questions`, `tips`, `news`, `troubleshooting` |
| `content_status` | text            | `'draft'`            | `draft`, `published`, `removed`                |
| `published_at`   | timestamptz     | nullable             | —                                              |
| `created_at`     | timestamptz     | `now()`              | —                                              |
| `updated_at`     | timestamptz     | `now()`              | —                                              |

### `community_posts_likes`

| Column       | Type                                     |
| ------------ | ---------------------------------------- |
| `user_id`    | uuid PK (composite) FK → users           |
| `post_id`    | uuid PK (composite) FK → community_posts |
| `created_at` | timestamptz                              |

### `bookmarked_posts`

| Column       | Type                                     |
| ------------ | ---------------------------------------- |
| `user_id`    | uuid PK (composite) FK → users           |
| `post_id`    | uuid PK (composite) FK → community_posts |
| `created_at` | timestamptz                              |

### `community_post_comments`

| Column              | Type                      | Notes                         |
| ------------------- | ------------------------- | ----------------------------- |
| `comment_id`        | uuid PK                   | auto-generated                |
| `post_id`           | uuid FK → community_posts | —                             |
| `author_id`         | uuid FK → users           | —                             |
| `content`           | text                      | —                             |
| `parent_comment_id` | uuid FK → self            | nullable (for nested replies) |
| `is_edited`         | boolean                   | default `false`               |
| `edited_at`         | timestamptz               | nullable                      |
| `created_at`        | timestamptz               | `now()`                       |
| `updated_at`        | timestamptz               | `now()`                       |

### `community_comments_likes`

| Column       | Type                                             |
| ------------ | ------------------------------------------------ |
| `user_id`    | uuid PK (composite) FK → users                   |
| `comment_id` | uuid PK (composite) FK → community_post_comments |
| `created_at` | timestamptz                                      |

### `community_posts_attachments`

| Column          | Type                      |
| --------------- | ------------------------- |
| `attachment_id` | uuid PK                   |
| `post_id`       | uuid FK → community_posts |
| `file_url`      | text                      |
| `created_at`    | timestamptz               |

---

## ✅ Confirmed: `add_comment` Database Function

The `add_comment` function exists in Supabase as an RPC function. It uses `auth.uid()` internally (no author param needed). Usage:

```ts
const { data, error } = await supabase.rpc('add_comment', {
  p_content, // string — comment text
  p_parent_id, // uuid | null — parent comment id for replies
  p_post_id, // uuid — the post being commented on
});
```

**Action required before Phase 2:** Run `npx supabase gen types` to regenerate `types/supabase.ts` so the `add_comment` function appears in the TypeScript types. No migration needed.

---

## Phases Overview

| Phase | Spec Name                 | Summary                                                                         |
| ----- | ------------------------- | ------------------------------------------------------------------------------- |
| 1     | `shared-infinite-scroll`  | Extract infinite scroll logic from listings into a shared reusable hook         |
| 2     | `community-feed-queries`  | All Supabase queries for the feed: list posts, like, bookmark, comments, delete |
| 3     | `post-card-component`     | The post card UI with like, bookmark, share, comment count                      |
| 4     | `community-feed-page`     | The feed page with search, category filters, infinite scroll                    |
| 5     | `post-detail-modal`       | Modal with full post, comments system (add/edit/delete), like comments          |
| 6     | `profile-community-tab`   | Add "My Posts" tab in profile with update/delete                                |
| 7     | `home-page-integration`   | Mixed home page showing recent listings + community posts                       |
| 8     | `translations-and-polish` | en.json + ar.json keys, RTL testing, edge cases                                 |

---

## Phase 1 — `shared-infinite-scroll`

**Goal:** Extract the infinite scroll logic from `modules/listings/home/components/load-more/LoadMore.tsx` into a shared, reusable hook so both listings and community can use it.

### What to do

1. **Create `hooks/useInfiniteScroll.ts`** (shared hook):

```ts
type UseInfiniteScrollOptions<TItem, TFilters> = {
  initialHasMore: boolean;
  filters: TFilters;
  limit?: number;
  fetchAction: (params: {
    filters: TFilters;
    page: number;
    limit: number;
  }) => Promise<{
    success: boolean;
    data: { data: TItem[] };
    message?: string;
  }>;
};

// Returns: { items, showSpinner, error, sentinelRef }
```

- Uses `useInView` from `react-intersection-observer` (already installed).
- Tracks `page` with `useRef`, appends new items to state.
- Stops when returned items < limit.
- Returns a `sentinelRef` to attach to the scroll sentinel element.
- Resets state when `filters` change (via a `key` prop or internal `useEffect`).

2. **Create `components/infinite-scroll-sentinel/InfiniteScrollSentinel.tsx`** — a simple component that renders skeleton placeholders while loading. Accepts `skeleton` as a render prop so each consumer provides its own skeleton.

3. **Refactor `modules/listings/home/components/load-more/LoadMore.tsx`** to use `useInfiniteScroll` internally. The component itself stays the same from the outside (same props), but internally delegates to the shared hook.

4. **Verify** listings infinite scroll works identically after refactor.

### Spec Acceptance Criteria

- `hooks/useInfiniteScroll.ts` is fully typed and generic
- Listings `LoadMore` uses it with zero behavioral change
- The hook handles: loading, error, no-more-items, filter changes
- The sentinel component accepts a custom skeleton via render prop

---

## Phase 2 — `community-feed-queries`

**Goal:** All Supabase queries and server actions needed for the community feed — fetching posts, toggling like, toggling bookmark, comments CRUD, deleting posts.

### What to do

#### 2.1 — Prerequisites

Before starting, run `npx supabase gen types` to regenerate `types/supabase.ts`. This ensures the `add_comment` RPC function and any recent schema changes are reflected in the TypeScript types.

#### 2.2 — Add to `modules/community/queries.ts`

Add these query functions:

| Function                                              | Description                                                                                                                                                                                                    |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getCommunityPostsQuery({ filters, page, limit })`    | Fetch paginated published posts with author info (first_name, last_name, avatar_url), like count, comment count, bookmark status for current user, like status for current user. Order by `published_at` desc. |
| `togglePostLikeQuery(postId)`                         | Check if liked → delete, else → insert into `community_posts_likes`. Return `{ isLiked: boolean, likeCount: number }`.                                                                                         |
| `togglePostBookmarkQuery(postId)`                     | Same pattern as `toggleBookmarkQuery` for listings but using `bookmarked_posts` table. Return `{ isBookmarked: boolean }`.                                                                                     |
| `getPostCommentsQuery(postId)`                        | Fetch all comments for a post with author info and like count. Include `parent_comment_id` for threading. Order by `created_at` asc.                                                                           |
| `addCommentQuery(postId, content, parentId?)`         | Use `.rpc('add_comment', { p_post_id, p_content, p_parent_id })` — no author param needed, the DB function uses `auth.uid()` internally. Return the new comment with author info by fetching it after insert.  |
| `updateCommentQuery(commentId, content)`              | Update `content`, set `is_edited = true`, `edited_at = now()`. Auth check: only author can update.                                                                                                             |
| `deleteCommentQuery(commentId)`                       | Delete comment. Auth check: only author can delete.                                                                                                                                                            |
| `toggleCommentLikeQuery(commentId)`                   | Toggle like on a comment in `community_comments_likes`. Return `{ isLiked: boolean, likeCount: number }`.                                                                                                      |
| `deleteCommunityPostQuery(postId)`                    | Delete post + attachments. Auth check: only author. Also delete attachments from storage bucket.                                                                                                               |
| `getUserCommunityPostsQuery({ userId, page, limit })` | Paginated posts by a specific user (for profile tab).                                                                                                                                                          |
| `getPostDetailQuery(postId)`                          | Full post detail with author, attachments, like/bookmark/comment counts, current user's like/bookmark status.                                                                                                  |

#### 2.3 — The `getCommunityPostsQuery` select shape

```ts
const { data, error, count } = await client
  .from('community_posts')
  .select(
    `
    post_id, title, content, post_category, published_at, created_at,
    users!community_posts_author_id_fkey (
      user_id, first_name, last_name, avatar_url
    ),
    community_posts_attachments ( attachment_id, file_url ),
    community_posts_likes ( user_id ),
    community_post_comments ( comment_id ),
    bookmarked_posts ( user_id )
  `,
    { count: 'exact' }
  )
  .eq('content_status', 'published')
  .order('published_at', { ascending: false })
  .range(from, to);
```

Then flatten into a `CommunityPostCardItem` type:

```ts
export type CommunityPostCardItem = {
  post_id: string;
  title: string;
  content: string;
  post_category: PostCategory;
  published_at: string;
  created_at: string;
  author: {
    user_id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  attachments: { attachment_id: string; file_url: string }[];
  like_count: number;
  comment_count: number;
  is_liked: boolean; // current user liked?
  is_bookmarked: boolean; // current user bookmarked?
};
```

#### 2.4 — Add to `modules/community/actions.ts`

Wrap all new query functions with `errorHandler()`:

- `getCommunityPostsAction`
- `togglePostLikeAction` (revalidate `/community`)
- `togglePostBookmarkAction` (revalidate `/community`)
- `getPostCommentsAction`
- `addCommentAction` (revalidate relevant post)
- `updateCommentAction`
- `deleteCommentAction`
- `toggleCommentLikeAction`
- `deleteCommunityPostAction` (revalidate `/community` and profile)
- `getUserCommunityPostsAction`
- `getPostDetailAction`

### Spec Acceptance Criteria

- All queries use `authHandler()` for auth-required operations
- All actions wrapped with `errorHandler()`
- `getCommunityPostsQuery` returns flattened `CommunityPostCardItem[]` with counts computed from relation arrays (`.length`)
- Like/Bookmark toggles are atomic (check then insert/delete)
- `addCommentQuery` calls the `add_comment` RPC with `{ p_post_id, p_content, p_parent_id }`
- Comment update/delete has author ownership check
- Post delete also cleans up storage attachments

---

## Phase 3 — `post-card-component`

**Goal:** Build the `PostCard` component that renders a single community post in the feed — matching the screenshot design.

### Target Structure

```
modules/community/
  components/
    post-card/
      hooks/
        usePostActions.ts       ← like, bookmark, share logic
      types/
        index.ts
      PostCard.tsx               ← the card component
      PostCardSkeleton.tsx       ← loading skeleton
      index.ts
```

### Design Breakdown (from screenshot)

Each card has:

- **Header row:** Author avatar (circle) + author name + relative time (e.g., "منذ 2 ساعات") — right-aligned for RTL
- **Category badge:** Colored pill badge (سؤال / نصائح / أخبار / حلول المشاكل)
- **Title:** Bold text
- **Content preview:** 2 lines of content text, truncated with `...`
- **Action bar:** Bookmark icon | Share icon | (spacer) | Comment count + icon | Like count + heart icon

### What to do

1. **`PostCard.tsx`:**
   - Accept `CommunityPostCardItem` + `currentUserId` props.
   - Author section: `Avatar` component (from radix/shadcn) + name + `date-fns` `formatDistanceToNow` for relative time with locale support (`ar` / `en`).
   - Category badge: Use shadcn `Badge` with variant colors per category (questions = blue, tips = green, news = orange, troubleshooting = purple).
   - Content: `line-clamp-2` for truncation.
   - Actions bar: four actions in a row.

2. **`usePostActions.ts`** hook:
   - **Like:** Optimistic update. On click: immediately toggle `isLiked` and `likeCount ± 1` in local state. Call `togglePostLikeAction` in background. Revert on failure.
   - **Bookmark:** Optimistic update. Same pattern as listings `useBookmarkStatus`. On click: toggle `isBookmarked`. Call `togglePostBookmarkAction`. Revert on failure + toast error.
   - **Share:** Copy post URL (`/community/{postId}`) to clipboard using `navigator.clipboard.writeText()`. Show sonner `toast.success(t('linkCopied'))`. This is the simplest and best UX — no extra component needed, sonner toast is sufficient.
   - **Comment:** On click: open the post detail modal (Phase 5). This just calls a callback `onOpenComments(postId)`.

3. **`PostCardSkeleton.tsx`:** Skeleton matching the card layout for loading states.

4. **Attachment indicators:** If a post has attachments, show a small paperclip icon + count next to the content preview.

### Spec Acceptance Criteria

- Card matches the screenshot design (RTL-aware, responsive)
- Like toggle is optimistic with rollback on error
- Bookmark toggle is optimistic with rollback on error
- Share copies link and shows toast notification
- Comment click triggers a callback (modal handled in Phase 5)
- Relative time uses `date-fns` (already installed) with locale support (en/ar)
- Category badge has distinct color per category
- Works in both LTR (en) and RTL (ar) layouts

---

## Phase 4 — `community-feed-page`

**Goal:** Build the community feed page with search, category filter tabs, infinite scroll, and a "create post" button.

### Target Structure

```
app/[locale]/(main)/community/
  page.tsx                          ← route page

modules/community/
  feed/
    components/
      category-tabs/
        CategoryTabs.tsx            ← filter tabs (الكل, أسئلة, نصائح, أخبار, حلول المشاكل)
        index.ts
      community-search-bar/
        CommunitySearchBar.tsx      ← search input
        index.ts
      post-feed/
        PostFeed.tsx                ← server component, initial data fetch
        PostFeedClient.tsx          ← client component with infinite scroll
        index.ts
      create-post-button/
        CreatePostButton.tsx        ← FAB on mobile, inline button on desktop
        index.ts
    search-params.ts                ← nuqs search params (category, search)
    index.ts
    CommunityFeedPage.tsx           ← main page component
```

### What to do

1. **`search-params.ts`** — define search params using `nuqs`:
   - `category`: `parseAsString` (optional, filters by `post_category`)
   - `search`: `parseAsString` (optional, text search in title/content)

2. **`CommunityFeedPage.tsx`** — main page:
   - Parse search params.
   - Render: search bar, category tabs, post feed, create post button.
   - Page header: "المجتمع" / "Community".

3. **`CategoryTabs.tsx`:**
   - Horizontal scrollable tabs: All | Questions | Tips | News | Troubleshooting.
   - Active tab highlighted (filled background per screenshot).
   - Updates `category` search param via `nuqs` `useQueryState`.
   - "All" clears the category filter.

4. **`CommunitySearchBar.tsx`:**
   - Search input with search icon.
   - Debounced update to `search` search param via `nuqs`.
   - Same pattern as listings `SearchBar`.

5. **`PostFeed.tsx`** (server component):
   - Fetch first page of posts via `getCommunityPostsAction({ filters, page: 1 })`.
   - Pass to `PostFeedClient` along with `initialHasMore`.

6. **`PostFeedClient.tsx`** (client component):
   - Render initial posts as `PostCard` list.
   - Use `useInfiniteScroll` (from Phase 1) for loading more.
   - Empty state: icon + "No posts yet" message + "Create the first post" CTA.
   - Error state: icon + error message.

7. **`CreatePostButton.tsx`:**
   - **Desktop:** Place a "Create Post" / "منشور جديد" button in the page header area, right-aligned next to the page title. Use shadcn `Button` with a `Plus` icon. This is the best UX — visible, accessible, consistent with "Create Listing" pattern, doesn't obstruct content.
   - **Mobile:** Floating Action Button (FAB) at the bottom-right (bottom-left for RTL) — exactly like the screenshot shows with the pen icon + "منشور جديد" label. Fixed position, `z-50`, with shadow. Use `hidden md:flex` for desktop button and `flex md:hidden` for FAB.
   - Both link to `/community/create`.

8. **Route page** (`app/[locale]/(main)/community/page.tsx`):
   - Add `generateMetadata` for SEO.
   - Parse search params, render `CommunityFeedPage`.

9. **Add to navbar:**
   - Add `{ href: '/community', labelKey: 'community', allowedRoles: ['registered'] }` to `NAV_LINKS` in `components/layout/navbar/constants.ts`.
   - Add translation keys for "Community" / "المجتمع" in navbar translations.

### Spec Acceptance Criteria

- Feed page renders at `/community` with category filter tabs + search
- Infinite scroll loads more posts as user scrolls down
- Category tabs filter posts by `post_category`
- Search filters posts by title (ilike)
- Create post button: FAB on mobile, inline on desktop
- Empty state shown when no posts
- Page is in the main navbar navigation
- `generateMetadata` provides proper SEO title/description
- Works in both en and ar

---

## Phase 5 — `post-detail-modal`

**Goal:** When the user clicks the comment icon (or taps the post card), open a modal showing the full post with all comments. Users can add, edit, and delete their own comments — Facebook-style.

### Target Structure

```
modules/community/
  components/
    post-detail-modal/
      components/
        comment-item/
          hooks/
            useCommentActions.ts    ← edit, delete, like comment
          CommentItem.tsx           ← single comment with actions
          index.ts
        comment-form/
          hooks/
            useCommentForm.ts       ← form logic for add/edit
          CommentForm.tsx           ← input for adding a comment
          index.ts
        comment-list/
          CommentList.tsx           ← list of comments
          index.ts
      hooks/
        usePostDetailModal.ts       ← modal state, fetch comments
      types/
        index.ts
      PostDetailModal.tsx           ← the modal itself
      index.ts
```

### What to do

1. **Add `dialog.tsx` to `components/ui/`** — install shadcn Dialog component if not present (currently only `alert-dialog.tsx` and `sheet.tsx` exist). The Dialog is better than Sheet for this use case because it's a focused overlay with scroll.

2. **`PostDetailModal.tsx`:**
   - Uses shadcn `Dialog` (or `Sheet` from bottom on mobile for better UX).
   - Shows: full post (title, content untruncated, category, author, published_at, attachments as image gallery or file links).
   - Below the post: comment count + comment list + comment input.
   - Scrollable content area.

3. **`usePostDetailModal.ts`** hook:
   - State: `isOpen`, `postId`, `comments[]`, `isLoading`.
   - On open: fetch comments via `getPostCommentsAction(postId)`.
   - Exposes: `openModal(postId)`, `closeModal`, `comments`, `addComment`, `updateComment`, `deleteComment`.
   - Provide this via a Context so the feed page can trigger it from any PostCard.

4. **`CommentItem.tsx`:**
   - Shows: author avatar + name + relative time + comment content.
   - If `is_edited`: show "(edited)" / "(معدل)" label next to the time.
   - If current user is the author: show a three-dot menu (use shadcn `DropdownMenu`) with "Edit" and "Delete" options — Facebook-style.
   - **Edit:** Inline edit mode — replace the comment text with a textarea pre-filled with current content + Save/Cancel buttons.
   - **Delete:** Show `AlertDialog` confirmation ("Are you sure you want to delete this comment?" / "هل أنت متأكد من حذف هذا التعليق؟") → call `deleteCommentAction`.
   - **Like comment:** Small heart button with count. Optimistic update via `toggleCommentLikeAction`.

5. **`CommentForm.tsx`:**
   - Text input + send button at the bottom of the modal (sticky).
   - Uses `useForm` with a simple zod schema: `content: z.string().min(1).max(2000)`.
   - On submit: call `addCommentAction` which uses `.rpc('add_comment', { p_post_id, p_content, p_parent_id })`. No author ID needed — the DB function uses `auth.uid()` internally.
   - After success: append the new comment to the list optimistically (with current user's info already available client-side).
   - Also used for **reply** — when replying to a comment, show "Replying to [name]" indicator + pass `parentCommentId`.

6. **`CommentList.tsx`:**
   - Renders flat list of `CommentItem` components.
   - If `parent_comment_id` is used: group replies under parent comments with left-indentation (RTL: right-indentation). Keep V1 simple — flat display but show "↪ replying to [name]" prefix. Full threading can be V2.
   - Empty state: "No comments yet — be the first!" / "لا توجد تعليقات بعد — كن أول من يعلق!".

7. **Context provider — `PostDetailModalProvider`:**
   - Wrap the community feed page with this provider.
   - Any `PostCard` can call `openModal(postId)` via context.
   - The modal component renders at the provider level (portal).

### Comment type for the client:

```ts
export type CommentItem = {
  comment_id: string;
  content: string;
  parent_comment_id: string | null;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  author: {
    user_id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  like_count: number;
  is_liked: boolean;
};
```

### Spec Acceptance Criteria

- Clicking comment icon on PostCard opens the modal with full post + comments
- Comments load on modal open
- User can add a comment (calls `add_comment` RPC with `p_post_id`, `p_content`, `p_parent_id`)
- User can edit their own comment (inline edit with save/cancel)
- User can delete their own comment (with AlertDialog confirmation)
- Comment like with optimistic update
- "(edited)" / "(معدل)" indicator on edited comments
- Modal scrollable, comment input sticky at bottom
- Works in en and ar (RTL)
- Three-dot menu only visible for the comment author

---

## Phase 6 — `profile-community-tab`

**Goal:** Add a "My Posts" tab to the user's profile page showing their community posts with edit and delete actions.

### Target Structure

```
modules/user/profile/components/profile-tabs/
  profile-posts-tab/
    types/
      index.ts
    ProfilePostsTab.tsx             ← server component
    ProfilePostsTabClient.tsx       ← client component with list + actions
    ProfilePostsTabSkeleton.tsx
    ProfilePostsTabError.tsx
    index.ts
```

### What to do

1. **`ProfilePostsTab.tsx`** (server component):
   - Fetch user's community posts via `getUserCommunityPostsAction({ userId, page, limit })`.
   - Pass data to `ProfilePostsTabClient`.

2. **`ProfilePostsTabClient.tsx`** (client component):
   - Renders a list of simplified post cards (title, category badge, content preview, published_at, like/comment counts).
   - If `isOwner`: show Edit (pencil icon → navigates to `/community/[postId]/edit`) and Delete (trash icon → AlertDialog confirmation → `deleteCommunityPostAction`).
   - Same delete pattern as `ProfileListingsTabClient` with `deleteListingAction`.
   - Pagination: use the same profile pagination pattern (nuqs `page` param), not infinite scroll, to stay consistent with the existing profile listings tab.

3. **Update `ProfileTabs.tsx` and `ProfileTabsClient.tsx`:**
   - Add a third tab: "My Posts" / "منشوراتي".
   - Pass `postsContent` as a new prop alongside `listingsContent` and `bookmarkedContent`.
   - The posts tab is visible to everyone viewing the profile (like listings), not just the owner.

4. **Update `ProfileTabsClientProps`:**

   ```ts
   export type ProfileTabsClientProps = {
     isOwner: boolean;
     listingsContent: ReactNode;
     bookmarkedContent: ReactNode; // owner-only
     postsContent: ReactNode; // new — visible to all
   };
   ```

5. **Update `ProfilePage.tsx`:**
   - Pass `postsContent` to `ProfileTabs`.

### Spec Acceptance Criteria

- "My Posts" tab appears in profile for all users
- Owner sees Edit + Delete actions on their posts
- Delete uses AlertDialog confirmation
- Edit navigates to `/community/[postId]/edit`
- Pagination consistent with existing profile tabs pattern
- Skeleton and error states for the tab
- Translation keys for "My Posts" / "منشوراتي"

---

## Phase 7 — `home-page-integration`

**Goal:** Transform the home page from a listings-only page into a mixed landing page that connects both marketplace and community sections.

### Suggestion for Best Home Page UX

Currently `app/[locale]/(main)/page.tsx` renders `<ListingsPage />` directly. The home page should become a **hub** that gives users a taste of both sections and drives exploration. Recommended layout:

```
┌──────────────────────────────────────────────────────┐
│                   Hero / Welcome Banner              │
│      "Welcome to Gaza Tech Marketplace"              │
│      (optional — can add later or skip)              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📦 Latest Listings                    "View All →"  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ card   │ │ card   │ │ card   │ │ card   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  💬 Community Highlights               "View All →"  │
│  ┌──────────────────────────────────────┐            │
│  │ post card                            │            │
│  ├──────────────────────────────────────┤            │
│  │ post card                            │            │
│  ├──────────────────────────────────────┤            │
│  │ post card                            │            │
│  └──────────────────────────────────────┘            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Why this approach:**

- Users immediately see both sections — marketplace and community.
- "View All" links drive navigation to the full pages.
- Keeps the home page lightweight (no infinite scroll, no filters — just a preview).
- Each section loads independently with its own Suspense/ErrorBoundary.

### Target Structure

```
modules/home/
  components/
    latest-listings/
      LatestListings.tsx            ← server component, fetches 4 latest
      LatestListingsSkeleton.tsx
      index.ts
    community-highlights/
      CommunityHighlights.tsx       ← server component, fetches 3 latest posts
      CommunityHighlightsSkeleton.tsx
      index.ts
  index.ts
  HomePage.tsx

app/[locale]/(main)/
  page.tsx                          ← updated to render HomePage
```

### What to do

1. **Create `modules/home/HomePage.tsx`:**
   - Render two sections vertically: "Latest Listings" and "Community Highlights".
   - Each section has a heading + "View All" / "عرض الكل" link.

2. **`LatestListings.tsx`** (server component):
   - Fetch 4 most recent published listings via `getListingsAction({ filters: {}, page: 1, limit: 4 })`.
   - Render using the existing `ListingsGrid` component (already exists, renders listing cards).
   - "View All" link → `/listings`.

3. **`CommunityHighlights.tsx`** (server component):
   - Fetch 3 most recent published community posts via `getCommunityPostsAction({ filters: {}, page: 1, limit: 3 })`.
   - Render as `PostCard` list (same component from Phase 3).
   - "View All" link → `/community`.

4. **Update `app/[locale]/(main)/page.tsx`:**
   - Change from rendering `<ListingsPage />` to rendering `<HomePage />`.
   - The full listings page stays at `/listings` (route already exists at `app/[locale]/(main)/listings/page.tsx`).

5. **Keep `/listings` working** — it already has its own dedicated route, so no changes needed.

### Spec Acceptance Criteria

- Home page shows latest 4 listings + latest 3 community posts
- Each section has a heading + "View All" link
- Listings link to `/listings`, community links to `/community`
- Each section wrapped in its own `Suspense` + `ErrorBoundary` (independent loading)
- Responsive: stacked on mobile, can be two-column on wide desktop (optional)
- Translated headings and "View All" text

---

## Phase 8 — `translations-and-polish`

**Goal:** Add all translation keys, handle edge cases, RTL testing, and final polish.

### What to do

1. **Add translation keys to `messages/en.json` and `messages/ar.json`:**

   | Namespace              | Keys (examples)                                                                                                                                                                   |
   | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `Community.Feed`       | `title`, `searchPlaceholder`, `emptyTitle`, `emptyDescription`, `createFirstPost`, `errorTitle`, `errorDescription`                                                               |
   | `Community.Categories` | `all`, `questions`, `tips`, `news`, `troubleshooting`                                                                                                                             |
   | `Community.PostCard`   | `likeCount`, `commentCount`, `share`, `linkCopied`, `bookmark`, `bookmarkAdded`, `bookmarkRemoved`, `ago`                                                                         |
   | `Community.PostDetail` | `comments`, `noComments`, `beFirst`, `addComment`, `commentPlaceholder`, `edit`, `delete`, `deleteConfirm`, `deleteConfirmMessage`, `cancel`, `save`, `edited`, `replyTo`, `send` |
   | `Community.CreatePost` | `buttonLabel`                                                                                                                                                                     |
   | `Profile.Tabs`         | `myPosts`                                                                                                                                                                         |
   | `HomePage`             | `latestListings`, `communityHighlights`, `viewAll`                                                                                                                                |
   | `Navbar`               | `community`                                                                                                                                                                       |

2. **RTL-specific checks:**
   - FAB position: bottom-left in RTL, bottom-right in LTR. Use `ltr:right-6 rtl:left-6`.
   - Action bar icon order mirrors correctly.
   - Category tabs horizontal scroll direction.
   - Comment reply indentation: `ltr:ml-8 rtl:mr-8`.
   - Avatar + name row aligns correctly.

3. **Edge cases:**
   - **Not logged in:** Hide like/bookmark/add-comment actions. On click, show toast "Please log in" / "يرجى تسجيل الدخول" or redirect to login.
   - **Post author deleted account:** Show "Deleted User" / "مستخدم محذوف" with default avatar.
   - **Empty attachments:** Don't render attachment section at all.
   - **Very long title/content:** Proper truncation with `line-clamp-2` (title) and `line-clamp-2` (content).
   - **Rapid like/bookmark clicks:** Ignore clicks while `isPending` is true from `useTransition`.
   - **Delete own post from feed:** Remove the card from the list optimistically.
   - **Comment count update:** After adding/deleting a comment, update the comment count on the PostCard (via callback from modal to feed).

4. **Accessibility:**
   - All interactive elements have `aria-label` with translated text.
   - Modal has proper focus trap (Dialog component handles this).
   - Comment form: `aria-live="polite"` region for screen reader announcements.
   - Keyboard navigation: Tab through action buttons, Enter to activate.
   - Skip to main content link (if not already present).

5. **Performance considerations:**
   - `PostCard` should be wrapped in `React.memo` to prevent unnecessary re-renders during infinite scroll.
   - Comments fetched on modal open (lazy), not with the feed.
   - Image attachments: use `next/image` with proper `width`/`height`/`sizes`.

### Spec Acceptance Criteria

- All visible text is translated in en + ar
- RTL layout works correctly in Arabic
- Edge cases handled gracefully
- No untranslated strings visible in the UI
- Accessibility: focus trap in modal, aria-labels, keyboard nav
- Performance: memo on cards, lazy comment loading

---

## Execution Order & Dependencies

```
Phase 1 (shared-infinite-scroll)
   ↓
Phase 2 (community-feed-queries)     ← can run in parallel with Phase 1
   ↓
Phase 3 (post-card-component)        ← depends on Phase 2 types
   ↓
Phase 4 (community-feed-page)        ← depends on Phase 1 + 2 + 3
   ↓
Phase 5 (post-detail-modal)          ← depends on Phase 2 + 3
   ↓                                    can run in parallel with Phase 6 & 7
Phase 6 (profile-community-tab)      ← depends on Phase 2 + 3
   ↓
Phase 7 (home-page-integration)      ← depends on Phase 2 + 3 + 4
   ↓
Phase 8 (translations-and-polish)    ← depends on all above
```

**Parallelizable:**

- Phase 1 ‖ Phase 2
- Phase 5 ‖ Phase 6 ‖ Phase 7 (after Phase 4)

---

## Summary of All New Files

```
hooks/
  useInfiniteScroll.ts                               ← Phase 1

components/
  infinite-scroll-sentinel/
    InfiniteScrollSentinel.tsx                        ← Phase 1
    index.ts
  ui/
    dialog.tsx                                       ← Phase 5

modules/community/
  feed/
    components/
      category-tabs/
        CategoryTabs.tsx                             ← Phase 4
        index.ts
      community-search-bar/
        CommunitySearchBar.tsx                       ← Phase 4
        index.ts
      post-feed/
        PostFeed.tsx                                 ← Phase 4
        PostFeedClient.tsx                           ← Phase 4
        index.ts
      create-post-button/
        CreatePostButton.tsx                         ← Phase 4
        index.ts
    search-params.ts                                 ← Phase 4
    CommunityFeedPage.tsx                            ← Phase 4
    index.ts                                         ← Phase 4
  components/
    post-card/
      hooks/
        usePostActions.ts                            ← Phase 3
      types/
        index.ts                                     ← Phase 3
      PostCard.tsx                                   ← Phase 3
      PostCardSkeleton.tsx                           ← Phase 3
      index.ts                                       ← Phase 3
    post-detail-modal/
      components/
        comment-item/
          hooks/
            useCommentActions.ts                     ← Phase 5
          CommentItem.tsx                            ← Phase 5
          index.ts
        comment-form/
          hooks/
            useCommentForm.ts                        ← Phase 5
          CommentForm.tsx                            ← Phase 5
          index.ts
        comment-list/
          CommentList.tsx                            ← Phase 5
          index.ts
      hooks/
        usePostDetailModal.ts                        ← Phase 5
      types/
        index.ts                                     ← Phase 5
      PostDetailModal.tsx                            ← Phase 5
      PostDetailModalProvider.tsx                     ← Phase 5
      index.ts                                       ← Phase 5

modules/home/
  components/
    latest-listings/
      LatestListings.tsx                             ← Phase 7
      LatestListingsSkeleton.tsx                     ← Phase 7
      index.ts
    community-highlights/
      CommunityHighlights.tsx                        ← Phase 7
      CommunityHighlightsSkeleton.tsx                ← Phase 7
      index.ts
  HomePage.tsx                                       ← Phase 7
  index.ts                                           ← Phase 7

modules/user/profile/components/profile-tabs/
  profile-posts-tab/
    types/
      index.ts                                       ← Phase 6
    ProfilePostsTab.tsx                              ← Phase 6
    ProfilePostsTabClient.tsx                        ← Phase 6
    ProfilePostsTabSkeleton.tsx                      ← Phase 6
    ProfilePostsTabError.tsx                         ← Phase 6
    index.ts                                         ← Phase 6

app/[locale]/(main)/community/
  page.tsx                                           ← Phase 4
```

## Files Modified

```
modules/listings/home/components/load-more/LoadMore.tsx          ← Phase 1 (refactor to use shared hook)
modules/community/queries.ts                                     ← Phase 2 (add 11 query functions)
modules/community/actions.ts                                     ← Phase 2 (add 11 action wrappers)
modules/community/types/index.ts                                 ← Phase 2 (add CommunityPostCardItem, CommentItem types)
components/layout/navbar/constants.ts                            ← Phase 4 (add community nav link)
modules/user/profile/components/profile-tabs/ProfileTabs.tsx     ← Phase 6 (add posts tab)
modules/user/profile/components/profile-tabs/ProfileTabsClient.tsx ← Phase 6 (add posts tab)
modules/user/profile/components/profile-tabs/types/index.ts      ← Phase 6 (update ProfileTabsClientProps)
modules/user/profile/ProfilePage.tsx                             ← Phase 6 (pass postsContent)
app/[locale]/(main)/page.tsx                                     ← Phase 7 (swap ListingsPage → HomePage)
messages/en.json                                                 ← Phase 8 (add all new translation keys)
messages/ar.json                                                 ← Phase 8 (add all new translation keys)
```

## Supabase Prerequisites

```
Run before Phase 2: npx supabase gen types   ← regenerate types/supabase.ts to include add_comment RPC
```
