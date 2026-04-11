# Research: Post Detail Modal

**Feature**: 009-post-detail-modal | **Date**: 2026-04-07

## R-001: Next.js Intercepting Routes for Modal Pattern

**Decision**: Use `@modal` parallel route with `(.)community/[postId]` intercepting route at the `(main)` layout level.

**Rationale**:

- Intercepting routes capture soft navigation (client-side Link clicks) and render the modal while keeping the feed visible behind it.
- Direct navigation or hard refresh at `/community/[postId]` renders the full-page fallback — no broken URLs.
- `(.)` prefix is correct because `@modal` and `community` are siblings at the same route segment level inside `(main)/`. Slots (`@`) and route groups (`()`) are not counted as segments.

**Folder structure**:

```
app/[locale]/(main)/
├── layout.tsx               # { children, modal } props
├── @modal/
│   ├── default.tsx          # returns null
│   └── (.)community/
│       └── [postId]/
│           └── page.tsx     # modal view
└── community/
    └── [postId]/
        └── page.tsx         # full-page fallback
```

**Key implementation details**:

- `layout.tsx` must accept and render `modal` as a parallel route prop.
- `@modal/default.tsx` returns `null` — required to prevent 404 on non-modal routes.
- Modal closes via `router.back()`, which pops the history entry and unmounts the slot.
- Escape key and overlay click also trigger `router.back()`.
- Use `<Link href={/community/${postId}}>` in post cards (replaces callback-based approach).

**Alternatives considered**:

- Client-side state modal (no URL update): Rejected — breaks shareability, no full-page fallback.
- Shallow routing with `nuqs`: Rejected — no server component support for the full-page fallback.

**Known gotchas**:

1. `revalidatePath()` does not reliably update parallel route slots (Next.js #54173). Use client-side state/optimistic updates instead.
2. `default.tsx` is mandatory — missing it causes 404 errors.
3. Modal may persist on unrelated route changes; a catch-all `@modal/[...catchAll]/page.tsx` returning `null` is a safety net.

## R-002: Dialog Component (shadcn/Radix)

**Decision**: Install shadcn Dialog component or create a minimal wrapper around Radix Dialog primitive.

**Rationale**:

- Project already uses Radix via `radix-ui` package (v1.4.3).
- `Sheet` component demonstrates the pattern (`Dialog as SheetPrimitive` import).
- Radix Dialog provides built-in: focus trap, Escape handling, portal rendering, ARIA roles, scroll lock.

**Implementation**:

- Create `components/ui/dialog.tsx` following shadcn conventions.
- Use `Dialog.Portal` + `Dialog.Overlay` + `Dialog.Content` for the modal shell.
- The intercepting route page wraps content in the Dialog (always open, `onOpenChange` triggers `router.back()`).

**Alternatives considered**:

- Reusing `Sheet` component: Rejected — Sheet is a side panel, not a centered modal.
- Using `AlertDialog`: Rejected — designed for confirmation prompts, not content-rich views.

## R-003: Post Card Navigation Change

**Decision**: Replace `onOpenComments` callback with `<Link>` navigation to `/community/[postId]`.

**Rationale**:

- Intercepting routes require actual navigation (URL change) to trigger.
- Current `onOpenComments` callback pattern (empty implementation in `FeedList`) was a placeholder for this phase.
- `<Link>` enables prefetching and is the idiomatic Next.js approach.

**Implementation**:

- PostCard's clickable areas (title, content preview, comment icon) become `<Link href={/community/${post.post_id}}>`.
- The `onOpenComments` prop and `handleOpenComments` callback are removed.
- `usePostCard` hook no longer needs `handleOpenComments`.

## R-004: Comment State Management

**Decision**: Use local React state in `useCommentSection` hook with optimistic updates. No global state library.

**Rationale**:

- Comments are scoped to a single modal instance — no need for global state.
- Optimistic updates for add/edit/delete/like provide instant feedback per spec (SC-002, SC-003).
- On server failure, revert optimistic state and show error toast via `sonner`.

**Pattern**:

```
useCommentSection(postId):
  - comments: TopLevelComment[]          # Local state, initialized from first fetch
  - hasMore: boolean                     # Pagination tracking
  - isLoading: boolean
  - loadMore()                           # Fetches next page via getPostCommentsAction
  - addComment(content, parentId?)       # Optimistic add → server → revert on error
  - editComment(commentId, content)      # Optimistic edit → server → revert on error
  - deleteComment(commentId)             # Optimistic remove → server → revert on error
  - toggleCommentLike(commentId)         # Optimistic toggle → server → revert on error
```

**Alternatives considered**:

- React Context for comment state: Rejected — unnecessary indirection for single-modal scope.
- Server Actions with `useActionState`: Rejected — optimistic updates need fine-grained control per comment.

## R-005: Feed State Sync (Comment Count + Post Actions)

**Decision**: Use `router.refresh()` on modal close OR update feed state via a shared callback.

**Rationale**:

- FR-014 requires comment count sync between modal and feed post card.
- FR-016 requires like/bookmark sync.
- Since `revalidatePath` is unreliable with parallel routes, client-side sync is more reliable.

**Implementation approach**:

- The intercepting route page receives `postId` from params.
- On modal close, call `router.back()` to return to feed. The feed will show updated counts on next navigation.
- For immediate sync: pass a callback via search params or use `router.refresh()` after `router.back()`.
- Alternatively: lift post state to a context provider at the `(main)/layout` level that both feed and modal can access.

**Final decision**: Use a lightweight `PostDetailContext` provider in the `(main)` layout. The modal updates post counts (likes, comments, bookmarks) in context, and the feed reads from context to reflect changes. This avoids refetching the entire feed.
