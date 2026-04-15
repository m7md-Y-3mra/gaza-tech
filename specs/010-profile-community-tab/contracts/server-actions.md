# Contracts: Server Actions Consumed by the Profile Posts Tab

**Feature**: 010-profile-community-tab
**Date**: 2026-04-11

This feature does NOT introduce new server actions. It consumes two existing ones from `modules/community/actions.ts`. Contracts are documented here so the tab's error handling and types are pinned to stable boundaries.

---

## 1. `getUserCommunityPostsAction`

**Location**: `modules/community/actions.ts`
**Delegates to**: `getUserCommunityPostsQuery` in `modules/community/queries.ts`
**Wrapped with**: `errorHandler()`

### Input

```ts
type GetUserCommunityPostsInput = {
  user_id: string; // UUID of the profile owner
  page?: number; // 1-based page index; defaults to 1
  limit?: number; // page size; defaults to DEFAULT_LIMIT_NUMBER
};
```

### Output (after this feature's R3 extension)

```ts
type ActionResult =
  | {
      success: true;
      data: {
        data: FeedPost[]; // posts on this page (length ≤ limit)
        has_more: boolean; // existing
        next_page: number | null; // existing
        total_count: number; // NEW — required for ProfilePagination.totalCount
      };
    }
  | {
      success: false;
      message: string;
      errors?: Record<string, string>;
    };
```

### Contract invariants

- **Published-only**: the server filters `content_status = 'published'`. Drafts, removed, or flagged posts MUST NOT appear in `data.data`. Consumers rely on this invariant for FR-003.
- **Ordering**: rows are returned in `published_at DESC` order. FR-003 depends on this.
- **Author match**: every row in `data.data` has `author_id === input.user_id`. The tab uses this implicitly when rendering owner controls (owner identity is re-checked by the parent profile page, not the query).
- **Total count scoped identically**: `total_count` applies the same `author_id` + `content_status = 'published'` filter used to populate `data.data`. It is NOT a global count.
- **Stable under pagination**: `total_count` does not change across adjacent pages issued within the same request cycle (apart from true concurrent writes, which are accepted).

### Consumer usage in this feature

Called exactly once per render of `ProfilePostsTab.tsx`:

```ts
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
```

Thrown errors are captured by the `<ErrorBoundary>` wrapping `ProfilePostsTab` in `ProfileTabs.tsx` and rendered via `ProfilePostsTabError` (satisfies FR-013).

---

## 2. `deleteCommunityPostAction`

**Location**: `modules/community/actions.ts`
**Delegates to**: `deleteCommunityPostQuery` in `modules/community/queries.ts`
**Wrapped with**: `errorHandler()`

### Input

```ts
type DeleteCommunityPostInput = {
  post_id: string; // UUID of the post to delete
};
```

### Output

```ts
type ActionResult =
  | {
      success: true;
      data: { post_id: string };
    }
  | {
      success: false;
      message: string; // user-safe, localizable error message
    };
```

### Contract invariants

- **Server-side ownership check**: the query fetches the post, compares `author_id` with the authenticated session, and throws `CustomError('not authorized')` if they do not match. The client is NOT the source of truth for ownership. Consumers may assume the action is safe to call for any post, but the UI still gates the Delete control on `isOwner` to avoid showing a button that will always fail (FR-007).
- **Soft delete**: the post is marked `content_status = 'removed'`; it is NOT physically deleted. From the tab's perspective this is transparent — the next `getUserCommunityPostsAction` call will not return the row (because the fetch filters `published`).
- **Path revalidation**: on success, the action calls `revalidatePath('/community', 'page')` and `revalidatePath('/profile/${author_id}', 'page')`. That second revalidation is what guarantees the profile page (and therefore this tab) returns fresh data after the delete, without the client having to trigger its own refetch.

### Consumer usage in this feature

Called inside `ProfilePostsTabClient.tsx` from a `useTransition` callback:

```ts
const handleDelete = (postId: string) => {
  startTransition(async () => {
    removeOptimisticPost(postId);
    const result = await deleteCommunityPostAction({ post_id: postId });
    if (!result.success) {
      toast.error(result.message);
    } else {
      toast.success(t('deleteSuccess'));
      // FR-020: if page becomes empty and page > 1, navigate to page - 1
    }
  });
};
```

---

## 3. Actions this feature does NOT call

To make scope explicit:

- `createCommunityPostAction` — the owner's "Create your first post" CTA (FR-014) is a `<Link>` to the existing create route, not a direct action call.
- `updateCommunityPostAction` — the Edit control is a `<Link>` to `/community/[postId]/edit` (FR-008), not a direct action call.
- `getCommunityPostDetailAction` — opening a post card navigates to `/community/[postId]` (FR-019); the detail page is responsible for its own fetch.
- `toggleLikeAction`, `toggleBookmarkAction`, `addCommentAction`, etc. — inherited by `PostCard`'s internal logic from Phase 3, unchanged by this feature.
