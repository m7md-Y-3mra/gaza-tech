# Quickstart: Post Detail Modal

**Feature**: 009-post-detail-modal | **Date**: 2026-04-07

## Prerequisites

- Community feed page functional (Phase 4)
- Post card component implemented (Phase 3)
- All comment server actions available (Phase 2): `getPostCommentsAction`, `addCommentAction`, `editOwnCommentAction`, `deleteOwnCommentAction`, `toggleCommentLikeAction`, `getCommunityPostDetailAction`
- shadcn Dialog component installed

## Setup Steps

### 1. Install shadcn Dialog component

```bash
npx shadcn@latest add dialog
```

If that fails, create `components/ui/dialog.tsx` manually using Radix Dialog primitive (see `components/ui/sheet.tsx` for pattern reference).

### 2. Create routing structure

```bash
# Parallel route slot
mkdir -p "app/[locale]/(main)/@modal/(.)community/[postId]"

# Full-page fallback
mkdir -p "app/[locale]/(main)/community/[postId]"
```

Create `app/[locale]/(main)/@modal/default.tsx`:

```tsx
export default function Default() {
  return null;
}
```

### 3. Update main layout

Add `modal` prop to `app/[locale]/(main)/layout.tsx`:

```tsx
export default function MainLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {modal}
    </>
  );
}
```

### 4. Key files to create (in order)

1. `components/ui/dialog.tsx` — shadcn Dialog
2. `modules/community/components/post-detail-modal/PostDetailModal.tsx` — Modal shell
3. `modules/community/post-detail/PostDetailPage.tsx` — Full-page fallback
4. `modules/community/components/comments/CommentSection.tsx` — Comments container
5. `modules/community/components/comments/components/comment-item/CommentItem.tsx` — Single comment
6. `modules/community/components/comments/components/comment-input/CommentInput.tsx` — Input with reply indicator
7. `modules/community/components/comments/components/comment-list/CommentList.tsx` — Scrollable list

### 5. Key existing files to modify

- `app/[locale]/(main)/layout.tsx` — Add `modal` slot prop
- `modules/community/components/post-card/PostCard.tsx` — Replace `onOpenComments` callback with `<Link>` navigation
- `modules/community/components/post-card/hooks/usePostCard.ts` — Remove `handleOpenComments`
- `modules/community/components/post-card/types/index.ts` — Remove `onOpenComments` from props
- `modules/community/community-feed/components/feed-list/FeedList.tsx` — Remove `handleOpenComments` callback, remove prop from PostCard

## Existing Server Actions Reference

```typescript
// Fetch full post detail
getCommunityPostDetailAction({ post_id: string }): Promise<FeedPost>

// Fetch paginated comments (oldest first, 20 per page)
getPostCommentsAction({ post_id, page?, limit? }): Promise<Page<TopLevelComment>>

// Fetch replies for a comment
getCommentRepliesAction({ comment_id, page?, limit? }): Promise<Page<CommentNode>>

// Add comment or reply
addCommentAction({ post_id, content, parent_comment_id? }): Promise<CommentNode>

// Edit own comment
editOwnCommentAction({ comment_id, content }): Promise<EditCommentResult>

// Delete own comment (cascades replies)
deleteOwnCommentAction({ comment_id }): Promise<DeleteCommentResult>

// Toggle comment like
toggleCommentLikeAction({ comment_id }): Promise<ToggleCommentLikeResult>
```

## i18n Keys to Add

Add to `messages/en.json` and `messages/ar.json` under a `Community.postDetail` namespace:

- Modal: close, loading
- Comments: title, empty state, load more, replying to, edited indicator
- Comment input: placeholder, send, character count
- Comment actions: edit, delete, like, reply, save, cancel
- Delete confirmation: title, message, confirm, cancel
- Errors: add failed, edit failed, delete failed, like failed, load failed, retry

## Dev Server

```bash
npm run dev    # Start at localhost:3000
npm run check  # Verify format + lint + types before committing
```
