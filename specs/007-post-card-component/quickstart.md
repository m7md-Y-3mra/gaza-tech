# Quickstart: Post Card Component

**Feature**: 007-post-card-component
**Date**: 2026-04-06

## Prerequisites

- Node.js 18+ and npm installed
- Existing community module with feed queries and server actions (Phase 2 complete)
- `date-fns` ^4.1.0, `lucide-react`, `sonner` already in dependencies

## Quick Usage

### Rendering a Post Card

```tsx
import { PostCard } from '@/modules/community/components/post-card';
import type { FeedPost } from '@/modules/community/types';

function CommunityFeed({ posts }: { posts: FeedPost[] }) {
  const handleOpenComments = (postId: string) => {
    // Open comment modal/drawer for this post
    console.log('Open comments for', postId);
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.post_id}
          post={post}
          onOpenComments={handleOpenComments}
        />
      ))}
    </div>
  );
}
```

### Rendering Skeletons During Loading

```tsx
import { PostCardSkeleton } from '@/modules/community/components/post-card';

function FeedLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### Consuming in a Server Component Page

```tsx
// app/[locale]/(main)/community/page.tsx
import { getCommunityFeedAction } from '@/modules/community/actions';
import { PostCard } from '@/modules/community/components/post-card';

export default async function CommunityPage() {
  const result = await getCommunityFeedAction({ page: 1, limit: 10 });

  if (!result.success) return <p>Error loading feed</p>;

  return (
    <div className="space-y-4">
      {result.data.data.map((post) => (
        <PostCard
          key={post.post_id}
          post={post}
          onOpenComments={(id) => {
            /* Phase 5 */
          }}
        />
      ))}
    </div>
  );
}
```

## Key Files

| File                                                          | Purpose                                         |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `modules/community/components/post-card/PostCard.tsx`         | Main interactive card (`'use client'`)          |
| `modules/community/components/post-card/PostCardSkeleton.tsx` | Server-renderable skeleton                      |
| `modules/community/components/post-card/index.ts`             | Public exports                                  |
| `modules/community/components/post-card/constants.ts`         | Category colors, avatar palette, time threshold |
| `modules/community/components/post-card/hooks/usePostCard.ts` | Optimistic state, handlers                      |
| `modules/community/components/post-card/types/index.ts`       | PostCardProps type                              |
| `hooks/use-current-user.ts`                                   | Shared auth hook (new)                          |
| `messages/en.json`                                            | English translations (PostCard.\*)              |
| `messages/ar.json`                                            | Arabic translations (PostCard.\*)               |

## i18n Keys Added

```
PostCard.like          / PostCard.unlike
PostCard.bookmark      / PostCard.unbookmark
PostCard.share         / PostCard.openComments
PostCard.shareCopied   / PostCard.shareError
PostCard.bookmarkAdded / PostCard.bookmarkRemoved
PostCard.likeError     / PostCard.bookmarkError
PostCard.attachments   (with count interpolation)
PostCard.openCommentsFor (accessible label with title)
PostCard.deletedUser
PostCard.categories.questions / tips / news / troubleshooting
```

## Development Workflow

Run the development server:

```bash
npm run dev
```

Check code quality:

```bash
npm run check  # format + lint + type-check
```

## Architecture Notes

- **PostCard** is a single `'use client'` component — all interactive state (optimistic like/bookmark, auth gating, clipboard) lives here
- **PostCardSkeleton** has no `'use client'` directive — safe for server rendering
- **useCurrentUser** is a shared hook in `hooks/` — reusable by later phases (comments, profile, etc.)
- The card does NOT fetch data — it receives a pre-built `FeedPost` via props
- The card does NOT render comments — it delegates to `onOpenComments`
- Server actions (`togglePostLikeAction`, `togglePostBookmarkAction`) are called directly from the client component
