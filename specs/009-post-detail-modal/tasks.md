# Tasks: Post Detail Modal

**Input**: Design documents from `/specs/009-post-detail-modal/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No tests requested. Implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app (Next.js): `app/`, `modules/`, `components/`, `messages/` at repository root

---

## CRITICAL CONTEXT FOR IMPLEMENTING LLM

> **READ THIS ENTIRE SECTION BEFORE STARTING ANY TASK.**

### Tech Stack

- TypeScript 5.x, Next.js 16 (App Router), React 19, `next-intl` ^4.7.0, `date-fns` ^4.1.0, `lucide-react` ^0.562.0, `sonner` ^2.0.7, shadcn/ui (radix-ui v1.4.3), Tailwind CSS ^4
- This is a **frontend-only** feature. All server actions already exist in `modules/community/actions.ts`. **DO NOT** create new server actions or modify `queries.ts`.

### Project Rules (NON-NEGOTIABLE)

1. **Module structure**: All feature components go in `modules/community/components/` or `modules/community/post-detail/`. Routes under `app/` are thin wrappers that import module pages.
2. **Component organization**: UI in `<Component>.tsx`, logic in `hooks/useComponentName.ts`, types in `types/index.ts`, constants in `constants.ts`. No mixed responsibilities.
3. **Server vs Client**: Server components by default. Use `'use client'` only for client-side state, user interaction, browser APIs.
4. **i18n**: Use `next-intl`. Translations use `useTranslations('NamespaceName')`. Keys are nested with dots. Add translations to BOTH `messages/en.json` AND `messages/ar.json`.
5. **Error handling**: Server actions are already wrapped with `errorHandler()`. They return `{ success: boolean, data?: T, message?: string }`.
6. **Locale params**: Pages under `[locale]` receive `params: Promise<{ locale: string }>`. Use `const { locale } = await params;`.
7. **Accessibility**: WCAG AA. Semantic HTML, ARIA where needed, keyboard navigation, 4.5:1 contrast, focus states.
8. **RTL**: All UI must work in both LTR (English) and RTL (Arabic). Use logical properties (`start`/`end` instead of `left`/`right`).

### Existing Server Actions (DO NOT MODIFY — just call them)

All imported from `@/modules/community/actions`:

```typescript
// Fetch full post detail — returns { success: true, data: FeedPost }
getCommunityPostDetailAction({ post_id: string })

// Fetch paginated comments (oldest first, 20 per page) — returns { success: true, data: Page<TopLevelComment> }
getPostCommentsAction({ post_id: string, page?: number, limit?: number })

// Fetch replies for a comment — returns { success: true, data: Page<CommentNode> }
getCommentRepliesAction({ comment_id: string, page?: number, limit?: number })

// Add comment or reply — returns { success: true, data: CommentNode }
addCommentAction({ post_id: string, content: string, parent_comment_id?: string })

// Edit own comment — returns { success: true, data: { comment_id, content, edited_at, is_edited } }
editOwnCommentAction({ comment_id: string, content: string })

// Delete own comment (cascades replies) — returns { success: true, data: { comment_id } }
deleteOwnCommentAction({ comment_id: string })

// Toggle comment like — returns { success: true, data: { is_liked: boolean, like_count: number } }
toggleCommentLikeAction({ comment_id: string })

// Toggle post like — returns { success: true, data: { is_liked: boolean, like_count: number } }
togglePostLikeAction({ post_id: string })

// Toggle post bookmark — returns { success: true, data: { is_bookmarked: boolean } }
togglePostBookmarkAction({ post_id: string })
```

### Existing Types (DO NOT RECREATE — import from `@/modules/community/types`)

```typescript
type FeedPost = {
  post_id: string;
  author: AuthorStub;
  title: string;
  content: string;
  post_category: string;
  published_at: string;
  attachments: FeedAttachment[];
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
};

type AuthorStub = {
  id: string | null;
  name: string;
  avatar_url: string | null;
};
type FeedAttachment = { attachment_id: string; file_url: string };

type CommentNode = {
  comment_id: string;
  post_id: string;
  author: AuthorStub;
  content: string;
  parent_comment_id: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
  like_count: number;
  is_liked: boolean;
};

type TopLevelComment = CommentNode & {
  replies: CommentNode[];
  replies_count: number;
  has_more_replies: boolean;
};

type Page<T> = { data: T[]; has_more: boolean; next_page: number | null };
```

### Existing Auth Hook

```typescript
// Import from '@/hooks/use-current-user'
// Returns { user: User | null, isLoading: boolean }
// user.id is the current user's UUID — compare with comment.author.id to check ownership
```

### Radix UI Import Pattern

This project uses `radix-ui` v1.4.3 (unified package). Import like this:

```typescript
import { Dialog as DialogPrimitive } from 'radix-ui';
// Then use: DialogPrimitive.Root, DialogPrimitive.Portal, DialogPrimitive.Overlay, DialogPrimitive.Content, etc.
```

See `components/ui/sheet.tsx` for the exact pattern used in this project. **DO NOT** use `@radix-ui/react-dialog` — that's the old package name.

### Existing UI Components You Can Use

- `components/ui/alert-dialog.tsx` — AlertDialog (for delete confirmation). Uses same `radix-ui` import pattern.
- `components/ui/sheet.tsx` — Reference for Dialog component pattern (Portal + Overlay + Content).
- `components/ui/button.tsx` — Button component with `variant` and `size` props.
- `@/lib/utils.ts` — exports `cn()` for class merging.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Dialog component and create routing structure for intercepting routes.

- [x] T001 Create shadcn Dialog component at `components/ui/dialog.tsx`

  **EXACT INSTRUCTIONS**: Create `components/ui/dialog.tsx` following the same pattern as `components/ui/sheet.tsx`. Key differences from Sheet:
  - Import: `import { Dialog as DialogPrimitive } from 'radix-ui';`
  - Components to export: `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogTrigger`
  - `DialogOverlay`: Same as SheetOverlay (fixed inset-0 z-50 bg-black/50 with fade animations)
  - `DialogContent`: Centered modal (NOT side panel). Use these classes:
    ```
    'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed start-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-lg border shadow-lg duration-200 sm:max-w-2xl rtl:-translate-x-[-50%]'
    ```
  - `DialogContent` must render inside `DialogPortal` with `DialogOverlay`
  - Include close button (X icon) using `DialogPrimitive.Close` in top-end corner
  - `DialogHeader`: `flex flex-col gap-1.5 p-4`
  - `DialogFooter`: `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-4`
  - `DialogTitle`: `text-foreground text-lg font-semibold`
  - `DialogDescription`: `text-muted-foreground text-sm`
  - Use `'use client'` directive
  - Use `cn()` from `@/lib/utils` and `XIcon` from `lucide-react`
  - Use `data-slot` attributes matching the shadcn convention (e.g., `data-slot="dialog-content"`)

- [x] T002 Create `@modal` parallel route default file at `app/[locale]/(main)/@modal/default.tsx`

  **EXACT INSTRUCTIONS**: Create this file with:

  ```tsx
  export default function Default() {
    return null;
  }
  ```

  This is required by Next.js to prevent 404 on non-modal routes. Without this file, navigating to any page under `(main)/` will throw a 404.

- [x] T003 [P] Create catch-all safety net at `app/[locale]/(main)/@modal/[...catchAll]/page.tsx`

  **EXACT INSTRUCTIONS**: Create this file with:

  ```tsx
  export default function CatchAll() {
    return null;
  }
  ```

  This prevents the modal from persisting on unrelated route changes (known Next.js gotcha from research.md R-001).

- [x] T004 Update main layout to accept `modal` slot prop at `app/[locale]/(main)/layout.tsx`

  **EXACT INSTRUCTIONS**: The current file is:

  ```tsx
  import { Navbar } from '@/components/layout/navbar';

  export default function MainLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
      </>
    );
  }
  ```

  Change it to:

  ```tsx
  import { Navbar } from '@/components/layout/navbar';

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

  Only add `modal` to the props type and render `{modal}` after `</main>`. Do NOT change anything else.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create PostDetailContext for syncing state between modal and feed, and add i18n keys.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create PostDetailContext provider at `modules/community/components/post-detail-context/PostDetailContext.tsx`

  **EXACT INSTRUCTIONS**: Create a React context provider that syncs post-level changes (likes, bookmarks, comment count) between the modal and feed cards.

  File: `modules/community/components/post-detail-context/PostDetailContext.tsx`

  ```tsx
  'use client';

  import {
    createContext,
    useContext,
    useCallback,
    useRef,
    useSyncExternalStore,
  } from 'react';

  type PostUpdatePayload = {
    post_id: string;
    like_count?: number;
    is_liked?: boolean;
    is_bookmarked?: boolean;
    comment_count?: number;
  };

  type PostDetailContextValue = {
    getPostUpdate: (postId: string) => PostUpdatePayload | undefined;
    updatePost: (payload: PostUpdatePayload) => void;
    subscribe: (listener: () => void) => () => void;
  };

  const PostDetailContext = createContext<PostDetailContextValue | null>(null);

  export function PostDetailProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const storeRef = useRef(new Map<string, PostUpdatePayload>());
    const listenersRef = useRef(new Set<() => void>());

    const subscribe = useCallback((listener: () => void) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    }, []);

    const getPostUpdate = useCallback((postId: string) => {
      return storeRef.current.get(postId);
    }, []);

    const updatePost = useCallback((payload: PostUpdatePayload) => {
      const existing = storeRef.current.get(payload.post_id);
      storeRef.current.set(payload.post_id, { ...existing, ...payload });
      listenersRef.current.forEach((listener) => listener());
    }, []);

    return (
      <PostDetailContext.Provider
        value={{ getPostUpdate, updatePost, subscribe }}
      >
        {children}
      </PostDetailContext.Provider>
    );
  }

  export function usePostDetailContext() {
    const context = useContext(PostDetailContext);
    if (!context) {
      throw new Error(
        'usePostDetailContext must be used within PostDetailProvider'
      );
    }
    return context;
  }

  export function usePostUpdate(postId: string) {
    const { getPostUpdate, subscribe } = usePostDetailContext();
    return useSyncExternalStore(
      subscribe,
      () => getPostUpdate(postId),
      () => undefined
    );
  }
  ```

  Also create `modules/community/components/post-detail-context/index.ts`:

  ```tsx
  export {
    PostDetailProvider,
    usePostDetailContext,
    usePostUpdate,
  } from './PostDetailContext';
  ```

- [x] T006 Wrap main layout with PostDetailProvider at `app/[locale]/(main)/layout.tsx`

  **EXACT INSTRUCTIONS**: After T004, update the layout to wrap ONLY `{children}` and `{modal}` with PostDetailProvider — NOT `<Navbar />`. The Navbar is a server component and must NOT be placed inside a client boundary.

  ```tsx
  import { Navbar } from '@/components/layout/navbar';
  import { PostDetailProvider } from '@/modules/community/components/post-detail-context';

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
        <PostDetailProvider>
          <main>{children}</main>
          {modal}
        </PostDetailProvider>
      </>
    );
  }
  ```

  **WHY**: `PostDetailProvider` is a `'use client'` component. Wrapping the entire layout (including `<Navbar />`) would force the Navbar into a client boundary, violating the server-first rendering principle. By wrapping only `{children}` and `{modal}`, the Navbar stays server-rendered and only the content area becomes a client boundary where context is needed.

- [x] T007 [P] Add i18n keys for PostDetail namespace in `messages/en.json` and `messages/ar.json`

  **EXACT INSTRUCTIONS**: Add a new `"PostDetail"` top-level key in BOTH `messages/en.json` and `messages/ar.json`. Insert it AFTER the `"PostCard"` block (before `"CommunityFeed"`).

  **en.json** — add this block:

  ```json
  "PostDetail": {
    "modal": {
      "close": "Close",
      "loading": "Loading post..."
    },
    "comments": {
      "title": "Comments",
      "titleWithCount": "{count, plural, one {# Comment} other {# Comments}}",
      "empty": "No comments yet — be the first!",
      "loadMore": "Load more comments",
      "loadMoreReplies": "Load more replies",
      "replyingTo": "Replying to {name}",
      "edited": "(edited)",
      "deletedComment": "This comment has been deleted"
    },
    "commentInput": {
      "placeholder": "Write a comment...",
      "replyPlaceholder": "Write a reply...",
      "send": "Send",
      "charCount": "{current}/{max}"
    },
    "commentActions": {
      "edit": "Edit",
      "delete": "Delete",
      "like": "Like",
      "unlike": "Unlike",
      "reply": "Reply",
      "save": "Save",
      "cancel": "Cancel"
    },
    "deleteConfirm": {
      "title": "Delete comment",
      "message": "Are you sure you want to delete this comment? This action cannot be undone.",
      "confirm": "Delete",
      "cancel": "Cancel"
    },
    "errors": {
      "addFailed": "Failed to add comment",
      "editFailed": "Failed to edit comment",
      "deleteFailed": "Failed to delete comment",
      "likeFailed": "Failed to update like",
      "loadFailed": "Failed to load comments",
      "loadPostFailed": "Failed to load post",
      "retry": "Try again"
    },
    "fullPage": {
      "backToFeed": "Back to community"
    }
  },
  ```

  **ar.json** — add this block:

  ```json
  "PostDetail": {
    "modal": {
      "close": "إغلاق",
      "loading": "جاري تحميل المنشور..."
    },
    "comments": {
      "title": "التعليقات",
      "titleWithCount": "{count, plural, one {تعليق واحد} other {# تعليقات}}",
      "empty": "لا توجد تعليقات بعد — كن أول من يعلق!",
      "loadMore": "تحميل المزيد من التعليقات",
      "loadMoreReplies": "تحميل المزيد من الردود",
      "replyingTo": "رد على {name}",
      "edited": "(تم التعديل)",
      "deletedComment": "تم حذف هذا التعليق"
    },
    "commentInput": {
      "placeholder": "اكتب تعليقاً...",
      "replyPlaceholder": "اكتب رداً...",
      "send": "إرسال",
      "charCount": "{current}/{max}"
    },
    "commentActions": {
      "edit": "تعديل",
      "delete": "حذف",
      "like": "إعجاب",
      "unlike": "إلغاء الإعجاب",
      "reply": "رد",
      "save": "حفظ",
      "cancel": "إلغاء"
    },
    "deleteConfirm": {
      "title": "حذف التعليق",
      "message": "هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.",
      "confirm": "حذف",
      "cancel": "إلغاء"
    },
    "errors": {
      "addFailed": "فشل إضافة التعليق",
      "editFailed": "فشل تعديل التعليق",
      "deleteFailed": "فشل حذف التعليق",
      "likeFailed": "فشل تحديث الإعجاب",
      "loadFailed": "فشل تحميل التعليقات",
      "loadPostFailed": "فشل تحميل المنشور",
      "retry": "حاول مرة أخرى"
    },
    "fullPage": {
      "backToFeed": "العودة إلى المجتمع"
    }
  },
  ```

  **IMPORTANT**: Make sure to add a comma after the `"PostCard"` block's closing `}` before inserting this new block. The JSON must remain valid.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — View Full Post in Modal (Priority: P1) MVP

**Goal**: User clicks a post card in the feed, a modal opens with full post content (title, body, author, category, date, attachments, action bar). Modal is closable via X, Escape, or overlay click. URL updates to `/community/[postId]`. Direct navigation shows full-page fallback.

**Independent Test**: Click any post card in the feed → modal opens with complete post content, author info, category badge, timestamp, attachments. Close modal → return to feed. Navigate directly to `/community/[postId]` → see full-page view.

### Implementation for User Story 1

- [x] T008 [US1] Create post detail types at `modules/community/components/post-detail-modal/types/index.ts`

  **EXACT INSTRUCTIONS**: Create this file with types needed by the modal components:

  ```typescript
  import type { FeedPost } from '@/modules/community/types';

  export type PostDetailModalProps = {
    post: FeedPost;
  };
  ```

- [x] T009 [US1] Create PostDetailSkeleton at `modules/community/components/post-detail-modal/components/post-detail-skeleton/PostDetailSkeleton.tsx`

  **EXACT INSTRUCTIONS**: Create a loading skeleton for the modal content. Use Tailwind `animate-pulse` on `bg-muted rounded` divs to represent:
  - Author avatar (circle 40x40), name line, date line
  - Category badge placeholder
  - Title line (full width, h-6)
  - Content lines (3 lines, varying widths)
  - Action bar (3 small rectangles)

  This is a `'use client'` component (it's rendered inside the modal which is client-side).

- [x] T010 [US1] Create PostDetailHeader at `modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx`

  **EXACT INSTRUCTIONS**: Display author avatar + name + relative date + category badge. This component reuses the same avatar/time/category logic from `PostCard.tsx`. Key points:
  - Props: `{ post: FeedPost }`
  - Use `useTranslations('PostCard')` for category labels (reuse existing translations)
  - Use `useLocale()` from `next-intl` for locale-aware date formatting
  - Reuse `CATEGORY_COLOR_MAP`, `AVATAR_PALETTE`, `getAvatarColorIndex` from `modules/community/components/post-card/constants`
  - Use `formatDistanceToNow` / `format` from `date-fns` with locale-aware formatting (same logic as PostCard)
  - Author avatar: 40x40 circle with initials fallback or `next/image` for avatar_url
  - If author.id is null, show "Deleted user" (no link). Otherwise link to `/${locale}/profile/${author.id}`
  - `'use client'` directive required (uses hooks)

- [x] T011 [US1] Create PostDetailContent at `modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent.tsx`

  **EXACT INSTRUCTIONS**: Display full untruncated post body and attachments.
  - Props: `{ content: string, attachments: FeedAttachment[] }`
  - Import `FeedAttachment` from `@/modules/community/types`
  - Render content with `whitespace-pre-wrap` to preserve line breaks
  - If attachments exist, render them in a grid below the content:
    - 1 image: single full-width
    - 2 images: 2-column grid
    - 3+ images: 2-column grid
    - Use `next/image` with `fill` prop inside a `relative aspect-video` container
    - Add `rounded-lg overflow-hidden` to each image container
  - `'use client'` directive (rendered inside modal)

- [x] T012 [US1] Create PostDetailActions at `modules/community/components/post-detail-modal/components/post-detail-actions/PostDetailActions.tsx`

  **EXACT INSTRUCTIONS**: Like, bookmark, share bar mirroring PostCard action bar. This component manages its own like/bookmark state with optimistic updates and syncs changes to PostDetailContext.
  - Props: `{ post: FeedPost }`
  - `'use client'` directive
  - Use the same like/bookmark/share logic as `usePostCard` hook but adapted:
    - Import `togglePostLikeAction`, `togglePostBookmarkAction` from `@/modules/community/actions`
    - Import `usePostDetailContext` from `@/modules/community/components/post-detail-context`
    - On successful like toggle: call `updatePost({ post_id, like_count, is_liked })`
    - On successful bookmark toggle: call `updatePost({ post_id, is_bookmarked })`
    - Use `useCurrentUser` from `@/hooks/use-current-user` for auth checks
    - Redirect to login if not authenticated (same pattern as usePostCard)
  - Use `Heart`, `MessageCircle`, `Bookmark`, `Share2` from `lucide-react`
  - Comment button shows count but does NOT navigate (user is already viewing the post)
  - Share copies `${window.location.origin}/community/${post.post_id}` to clipboard
  - Use `toast` from `sonner` for success/error feedback
  - Use `useTranslations('PostCard')` for existing action labels
  - **AUTH GATING (IMPORTANT)**: Like and bookmark buttons MUST check auth state before acting. If `!user` (from `useCurrentUser()`), redirect to `/${locale}/login?redirect=${encodeURIComponent(currentPath)}` instead of toggling. Use the exact same pattern as `usePostCard.handleLike` (lines 29-36 of `modules/community/components/post-card/hooks/usePostCard.ts`). Share button works for all users (no auth needed).

- [x] T013 [US1] Create PostDetailModal shell at `modules/community/components/post-detail-modal/PostDetailModal.tsx`

  **EXACT INSTRUCTIONS**: This is the main modal wrapper component that combines Dialog + post content.
  - Props: `{ post: FeedPost }`
  - `'use client'` directive
  - Import Dialog components from `@/components/ui/dialog`
  - The Dialog is always open (`open={true}`)
  - `onOpenChange`: when set to false, call `router.back()` to close (this unmounts the intercepting route)
  - Import `useRouter` from `next/navigation`
  - Structure:
    ```
    <Dialog open={true} onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-h-[85vh] flex flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">{post.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 px-4 pb-4">
          <PostDetailHeader post={post} />
          <h2 className="text-lg font-semibold">{post.title}</h2>
          <PostDetailContent content={post.content} attachments={post.attachments} />
          <PostDetailActions post={post} />
        </div>
      </DialogContent>
    </Dialog>
    ```
  - `DialogTitle` is visually hidden (`sr-only`) for accessibility — the visible title is rendered in the content area
  - Modal should have `max-h-[85vh]` and internal scroll via `overflow-y-auto` on content area
  - Use `useTranslations('PostDetail')` for modal-specific labels

- [x] T014 [US1] Create modal barrel export at `modules/community/components/post-detail-modal/index.ts`

  **EXACT INSTRUCTIONS**:

  ```typescript
  export { PostDetailModal } from './PostDetailModal';
  ```

- [x] T015 [US1] Create intercepting route page at `app/[locale]/(main)/@modal/(.)community/[postId]/page.tsx`

  **EXACT INSTRUCTIONS**: This is the intercepting route that renders the modal when user navigates client-side from the feed.

  ```tsx
  import { getCommunityPostDetailAction } from '@/modules/community/actions';
  import { PostDetailModal } from '@/modules/community/components/post-detail-modal';

  export default async function PostDetailModalPage({
    params,
  }: {
    params: Promise<{ locale: string; postId: string }>;
  }) {
    const { postId } = await params;

    const result = await getCommunityPostDetailAction({ post_id: postId });

    if (!result.success || !result.data) {
      return null;
    }

    return <PostDetailModal post={result.data} />;
  }
  ```

  This is a **server component** that fetches data and passes it to the client modal component. On fetch failure, return null (modal simply doesn't open).

- [x] T016 [US1] Create full-page fallback view at `modules/community/post-detail/PostDetailView.tsx`

  **EXACT INSTRUCTIONS**: This is a **client component** that receives the already-fetched post data as a prop and renders the full-page post detail view. It does NOT fetch data itself (server-first rendering principle).

  ```tsx
  'use client';

  import Link from 'next/link';
  import { useLocale, useTranslations } from 'next-intl';
  import { ArrowLeft } from 'lucide-react';
  import { PostDetailHeader } from '@/modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader';
  import { PostDetailContent } from '@/modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent';
  import { PostDetailActions } from '@/modules/community/components/post-detail-modal/components/post-detail-actions/PostDetailActions';
  import { CommentSection } from '@/modules/community/components/comments';
  import type { FeedPost } from '@/modules/community/types';

  export function PostDetailView({ post }: { post: FeedPost }) {
    const t = useTranslations('PostDetail');
    const locale = useLocale();

    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <Link
          href={`/${locale}/community`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('fullPage.backToFeed')}
        </Link>
        <article className="border-border bg-card space-y-4 rounded-xl border p-6">
          <PostDetailHeader post={post} />
          <h1 className="text-xl font-semibold">{post.title}</h1>
          <PostDetailContent
            content={post.content}
            attachments={post.attachments}
          />
          <PostDetailActions post={post} />
          <CommentSection
            postId={post.post_id}
            commentCount={post.comment_count}
          />
        </article>
      </div>
    );
  }
  ```

  Also create `modules/community/post-detail/index.ts`:

  ```typescript
  export { PostDetailView } from './PostDetailView';
  ```

  **WHY NOT `'use client'` data fetching?** Constitution Principle II forbids client-side data fetching for initial render. The route page (T017) fetches data server-side and passes it here.

- [x] T017 [US1] Create full-page route (server component) at `app/[locale]/(main)/community/[postId]/page.tsx`

  **EXACT INSTRUCTIONS**: This is a **server component** that fetches the post data server-side and passes it to the client view. This ensures the initial render is server-rendered per Constitution Principle II.

  ```tsx
  import { notFound } from 'next/navigation';
  import { getCommunityPostDetailAction } from '@/modules/community/actions';
  import { PostDetailView } from '@/modules/community/post-detail';

  export default async function PostDetailRoutePage({
    params,
  }: {
    params: Promise<{ locale: string; postId: string }>;
  }) {
    const { postId } = await params;

    const result = await getCommunityPostDetailAction({ post_id: postId });

    if (!result.success || !result.data) {
      notFound();
    }

    return <PostDetailView post={result.data} />;
  }
  ```

  **KEY DECISIONS**:
  - Data fetching happens server-side (NOT in useEffect)
  - On failure, use Next.js `notFound()` to render the 404 page
  - The `PostDetailView` client component receives pre-fetched data as props
  - No loading skeleton needed here — the page streams with server-side rendering

- [x] T018 [US1] Update PostCard to use Link navigation instead of callback — modify `modules/community/components/post-card/types/index.ts`

  **EXACT INSTRUCTIONS**: Remove `onOpenComments` from PostCardProps:

  ```typescript
  import type { FeedPost, PostCategory } from '@/modules/community/types';

  export type PostCardProps = {
    post: FeedPost;
  };

  export type CategoryColors = {
    bg: string;
    text: string;
  };

  export type CategoryColorMap = Record<PostCategory, CategoryColors>;
  ```

- [x] T019 [US1] Update usePostCard hook — modify `modules/community/components/post-card/hooks/usePostCard.ts`

  **EXACT INSTRUCTIONS**: Remove `onOpenComments` from the hook options and remove `handleOpenComments`. Also integrate with `usePostUpdate` to reflect context-synced state.

  Changes:
  1. Remove `onOpenComments` from `UsePostCardOptions` type
  2. Remove `handleOpenComments` function
  3. Remove `handleOpenComments` from return object
  4. Add `usePostUpdate` import and use it to override like/bookmark state when context has updates

  Updated type:

  ```typescript
  type UsePostCardOptions = {
    post: FeedPost;
  };
  ```

  Updated hook signature: `export function usePostCard({ post }: UsePostCardOptions)`

  Add near the top of the hook:

  ```typescript
  import { usePostUpdate } from '@/modules/community/components/post-detail-context';
  ```

  After state initialization, add context sync:

  ```typescript
  const postUpdate = usePostUpdate(post.post_id);

  // Apply context updates from modal interactions
  const effectiveLiked = postUpdate?.is_liked ?? isLiked;
  const effectiveLikeCount = postUpdate?.like_count ?? likeCount;
  const effectiveBookmarked = postUpdate?.is_bookmarked ?? isBookmarked;
  ```

  Return `effectiveLiked`, `effectiveLikeCount`, `effectiveBookmarked` instead of the raw state values. Remove `handleOpenComments` from return.

- [x] T020 [US1] Update PostCard component — modify `modules/community/components/post-card/PostCard.tsx`

  **EXACT INSTRUCTIONS**: Replace `onOpenComments` callback buttons with `<Link>` navigation.

  Changes:
  1. Remove `onOpenComments` from destructured props: `export function PostCard({ post }: PostCardProps)`
  2. Add `import Link from 'next/link';` and `import { useLocale } from 'next-intl';`
  3. Remove `handleOpenComments` from usePostCard destructuring
  4. Add `const locale = useLocale();` (actually it's already returned from usePostCard — use that)
  5. Replace the title `<button>` (line ~141-148) with:
     ```tsx
     <Link
       href={`/${locale}/community/${post.post_id}`}
       className="focus-visible:ring-ring line-clamp-1 w-full rounded-sm text-start hover:underline focus:outline-none focus-visible:ring-2"
     >
       {post.title}
     </Link>
     ```
  6. Replace the content preview `<button>` (line ~152-159) with:
     ```tsx
     <Link
       href={`/${locale}/community/${post.post_id}`}
       className={`text-muted-foreground focus-visible:ring-ring w-full rounded-sm text-start text-sm focus:outline-none focus-visible:ring-2 ${post.content ? 'line-clamp-2' : 'min-h-[2lh]'}`}
     >
       {contentPreview || <span className="invisible">placeholder</span>}
     </Link>
     ```
  7. Replace the comment `<button>` in action bar (line ~188-195) with:
     ```tsx
     <Link
       href={`/${locale}/community/${post.post_id}`}
       className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2"
       aria-label={t('openCommentsFor', { title: post.title })}
     >
       <MessageCircle className="h-4 w-4" aria-hidden="true" />
       <span>{formatCount(post.comment_count)}</span>
     </Link>
     ```
  8. Update variable names from `isLiked`/`likeCount`/`isBookmarked` to match the hook's new return names if you renamed them (effectiveLiked, etc.) — or keep the same names in the return and just change the internal implementation.

- [x] T021 [US1] Update FeedList to remove onOpenComments — modify `modules/community/community-feed/components/feed-list/FeedList.tsx`

  **EXACT INSTRUCTIONS**: Remove the `handleOpenComments` callback and the prop from PostCard.
  1. Remove lines 80-82:
     ```typescript
     const handleOpenComments = (_postId: string) => {
       // Comments modal handling will be implemented in a future phase.
     };
     ```
  2. Change the PostCard rendering (line ~88-92) to:
     ```tsx
     <PostCard key={post.post_id} post={post} />
     ```
     Remove the `onOpenComments={handleOpenComments}` prop.

**Checkpoint**: At this point, User Story 1 should be fully functional. Clicking a post card opens a modal with full post content. Closing returns to feed. Direct URL shows full-page view. Like/bookmark in modal syncs to feed card.

---

## Phase 4: User Story 2 — Add a Comment (Priority: P1)

**Goal**: Logged-in users can type and submit a comment in a sticky input at the bottom of the modal. The comment appears immediately via optimistic update.

**Independent Test**: Open post modal → type comment → submit → comment appears in list immediately. Refresh → comment persists. Submit empty → validation error shown.

### Implementation for User Story 2

- [x] T022 [US2] Create comment section types at `modules/community/components/comments/types/index.ts`

  **EXACT INSTRUCTIONS**:

  ```typescript
  import type { TopLevelComment, CommentNode } from '@/modules/community/types';

  export type CommentSectionProps = {
    postId: string;
    commentCount: number;
  };

  export type CommentSectionState = {
    comments: TopLevelComment[];
    hasMore: boolean;
    currentPage: number;
    isLoading: boolean;
    replyingTo: { commentId: string; authorName: string } | null;
    editingCommentId: string | null;
  };

  export type CommentInputProps = {
    postId: string;
    onSubmit: (content: string, parentCommentId?: string) => Promise<void>;
    replyingTo: { commentId: string; authorName: string } | null;
    onCancelReply: () => void;
    isSubmitting: boolean;
  };

  export type CommentItemProps = {
    comment: CommentNode;
    isReply?: boolean;
    currentUserId: string | null;
    onReply?: (commentId: string, authorName: string) => void;
    onEdit: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onToggleLike: (commentId: string) => Promise<void>;
    isEditing: boolean;
    onStartEdit: (commentId: string) => void;
    onCancelEdit: () => void;
  };

  export type CommentListProps = {
    comments: TopLevelComment[];
    currentUserId: string | null;
    onReply: (commentId: string, authorName: string) => void;
    onEdit: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onToggleLike: (commentId: string) => Promise<void>;
    editingCommentId: string | null;
    onStartEdit: (commentId: string) => void;
    onCancelEdit: () => void;
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
  };
  ```

- [x] T023 [US2] Create useCommentSection hook at `modules/community/components/comments/hooks/useCommentSection.ts`

  **EXACT INSTRUCTIONS**: This hook manages all comment state (fetch, add, edit, delete, like) with optimistic updates.

  `'use client'` is not needed in hook files — they're used inside client components.

  ```typescript
  import { useState, useCallback, useRef } from 'react';
  import { useTranslations } from 'next-intl';
  import { toast } from 'sonner';
  import {
    getPostCommentsAction,
    addCommentAction,
    editOwnCommentAction,
    deleteOwnCommentAction,
    toggleCommentLikeAction,
  } from '@/modules/community/actions';
  import { usePostDetailContext } from '@/modules/community/components/post-detail-context';
  import type { TopLevelComment, CommentNode } from '@/modules/community/types';
  import type { CommentSectionState } from '../types';

  const COMMENTS_PER_PAGE = 20;

  export function useCommentSection(
    postId: string,
    initialCommentCount: number
  ) {
    const t = useTranslations('PostDetail');
    const { updatePost } = usePostDetailContext();

    const [state, setState] = useState<CommentSectionState>({
      comments: [],
      hasMore: true,
      currentPage: 1,
      isLoading: true,
      replyingTo: null,
      editingCommentId: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentCountRef = useRef(initialCommentCount);
    const initialLoadDone = useRef(false);

    // ── Load comments ─────────────────────────────────────────────
    const loadComments = useCallback(
      async (page: number) => {
        setState((prev) => ({ ...prev, isLoading: true }));

        const result = await getPostCommentsAction({
          post_id: postId,
          page,
          limit: COMMENTS_PER_PAGE,
        });

        if (result.success && result.data) {
          setState((prev) => ({
            ...prev,
            comments:
              page === 1
                ? result.data.data
                : [...prev.comments, ...result.data.data],
            hasMore: result.data.has_more,
            currentPage: page,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
          toast.error(t('errors.loadFailed'));
        }
      },
      [postId, t]
    );

    // Initial load
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadComments(1);
    }

    const loadMore = useCallback(() => {
      loadComments(state.currentPage + 1);
    }, [loadComments, state.currentPage]);

    // ── Add comment ───────────────────────────────────────────────
    const addComment = useCallback(
      async (content: string, parentCommentId?: string) => {
        setIsSubmitting(true);

        const result = await addCommentAction({
          post_id: postId,
          content,
          parent_comment_id: parentCommentId,
        });

        setIsSubmitting(false);

        if (result.success && result.data) {
          const newComment = result.data as CommentNode;

          if (parentCommentId) {
            // Add as reply to parent
            setState((prev) => ({
              ...prev,
              comments: prev.comments.map((c) =>
                c.comment_id === parentCommentId
                  ? {
                      ...c,
                      replies: [...c.replies, newComment],
                      replies_count: c.replies_count + 1,
                    }
                  : c
              ),
              replyingTo: null,
            }));
          } else {
            // Add as top-level comment
            const topLevel: TopLevelComment = {
              ...newComment,
              replies: [],
              replies_count: 0,
              has_more_replies: false,
            };
            setState((prev) => ({
              ...prev,
              comments: [...prev.comments, topLevel],
            }));
          }

          commentCountRef.current += 1;
          updatePost({
            post_id: postId,
            comment_count: commentCountRef.current,
          });
        } else {
          toast.error(t('errors.addFailed'));
        }
      },
      [postId, t, updatePost]
    );

    // ── Edit comment ──────────────────────────────────────────────
    const editComment = useCallback(
      async (commentId: string, content: string) => {
        // Optimistic update
        setState((prev) => ({
          ...prev,
          comments: prev.comments.map((c) => {
            if (c.comment_id === commentId)
              return { ...c, content, is_edited: true };
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.comment_id === commentId
                  ? { ...r, content, is_edited: true }
                  : r
              ),
            };
          }),
          editingCommentId: null,
        }));

        const result = await editOwnCommentAction({
          comment_id: commentId,
          content,
        });

        if (!result.success) {
          toast.error(t('errors.editFailed'));
          // Reload to revert
          loadComments(1);
        }
      },
      [t, loadComments]
    );

    // ── Delete comment ────────────────────────────────────────────
    const deleteComment = useCallback(
      async (commentId: string) => {
        // Find comment to calculate count decrease
        let countDecrease = 1;
        const targetComment = state.comments.find(
          (c) => c.comment_id === commentId
        );
        if (targetComment) {
          countDecrease += targetComment.replies.length; // cascade
        }

        // Optimistic remove
        setState((prev) => ({
          ...prev,
          comments: prev.comments
            .filter((c) => c.comment_id !== commentId)
            .map((c) => ({
              ...c,
              replies: c.replies.filter((r) => r.comment_id !== commentId),
              replies_count: c.replies.some((r) => r.comment_id === commentId)
                ? c.replies_count - 1
                : c.replies_count,
            })),
        }));

        const result = await deleteOwnCommentAction({ comment_id: commentId });

        if (result.success) {
          commentCountRef.current -= countDecrease;
          updatePost({
            post_id: postId,
            comment_count: commentCountRef.current,
          });
        } else {
          toast.error(t('errors.deleteFailed'));
          loadComments(1);
        }
      },
      [state.comments, postId, t, updatePost, loadComments]
    );

    // ── Toggle comment like ───────────────────────────────────────
    const likeInFlight = useRef<Set<string>>(new Set());

    const toggleCommentLike = useCallback(
      async (commentId: string) => {
        // Prevent rapid clicks on the same comment
        if (likeInFlight.current.has(commentId)) return;
        likeInFlight.current.add(commentId);

        // Optimistic toggle
        setState((prev) => ({
          ...prev,
          comments: prev.comments.map((c) => {
            if (c.comment_id === commentId) {
              return {
                ...c,
                is_liked: !c.is_liked,
                like_count: c.is_liked ? c.like_count - 1 : c.like_count + 1,
              };
            }
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.comment_id === commentId
                  ? {
                      ...r,
                      is_liked: !r.is_liked,
                      like_count: r.is_liked
                        ? r.like_count - 1
                        : r.like_count + 1,
                    }
                  : r
              ),
            };
          }),
        }));

        const result = await toggleCommentLikeAction({ comment_id: commentId });

        likeInFlight.current.delete(commentId);

        if (!result.success) {
          toast.error(t('errors.likeFailed'));
          loadComments(1);
        }
      },
      [t, loadComments]
    );

    // ── Reply/edit management ─────────────────────────────────────
    const setReplyingTo = useCallback(
      (commentId: string, authorName: string) => {
        setState((prev) => ({
          ...prev,
          replyingTo: { commentId, authorName },
          editingCommentId: null,
        }));
      },
      []
    );

    const cancelReply = useCallback(() => {
      setState((prev) => ({ ...prev, replyingTo: null }));
    }, []);

    const startEdit = useCallback((commentId: string) => {
      setState((prev) => ({
        ...prev,
        editingCommentId: commentId,
        replyingTo: null,
      }));
    }, []);

    const cancelEdit = useCallback(() => {
      setState((prev) => ({ ...prev, editingCommentId: null }));
    }, []);

    return {
      ...state,
      isSubmitting,
      loadMore,
      addComment,
      editComment,
      deleteComment,
      toggleCommentLike,
      setReplyingTo,
      cancelReply,
      startEdit,
      cancelEdit,
    };
  }
  ```

- [x] T024 [US2] Create CommentInput component at `modules/community/components/comments/components/comment-input/CommentInput.tsx`

  **EXACT INSTRUCTIONS**: Sticky input at modal bottom with send button and optional reply indicator.
  - `'use client'` directive
  - Props: `CommentInputProps` from `../types`
  - Use `useTranslations('PostDetail')`
  - State: `content` string (controlled textarea)
  - Max length: 2000 characters. Show character count when > 1900 chars.
  - Validate: trim content must be 1-2000 chars before submit
  - On submit: call `onSubmit(content.trim(), replyingTo?.commentId)` then clear input
  - If `replyingTo` is set: show "Replying to {name}" indicator with X dismiss button above textarea
  - Send button: disabled when content is empty or `isSubmitting`
  - Use `Send` icon from `lucide-react` for send button
  - Use `X` icon from `lucide-react` for dismiss reply
  - Sticky positioning: `sticky bottom-0 bg-background border-t p-4`
  - Textarea: use plain `<textarea>` with `rows={1}` and auto-resize (simple approach: set rows based on content line count, max 4 rows)
  - Keyboard: submit on Enter (without Shift). Shift+Enter for new line.

  Also create `modules/community/components/comments/components/comment-input/index.ts`:

  ```typescript
  export { CommentInput } from './CommentInput';
  ```

- [x] T025 [US2] Create CommentSection container at `modules/community/components/comments/CommentSection.tsx`

  **EXACT INSTRUCTIONS**: Container that wires the hook to CommentInput (and later CommentList).
  - `'use client'` directive
  - Props: `CommentSectionProps` from `./types`
  - Uses `useCommentSection(postId, commentCount)` hook
  - Uses `useCurrentUser()` for auth state
  - Structure:
    ```
    <div className="flex flex-col border-t">
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h3>{t('comments.titleWithCount', { count: commentCount })}</h3>
        {isLoading && comments.length === 0 ? (
          <CommentSkeleton />
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">{t('comments.empty')}</p>
        ) : (
          /* CommentList will be added in Phase 5 (US3) */
          <div>Comments list placeholder</div>
        )}
      </div>
      {user && (
        <CommentInput
          postId={postId}
          onSubmit={addComment}
          replyingTo={replyingTo}
          onCancelReply={cancelReply}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
    ```
  - Comment input only shows for logged-in users (check `user` from `useCurrentUser()`)
  - Use `useTranslations('PostDetail')` for labels

  Also create `modules/community/components/comments/index.ts`:

  ```typescript
  export { CommentSection } from './CommentSection';
  ```

- [x] T026 [US2] Integrate CommentSection into PostDetailModal — modify `modules/community/components/post-detail-modal/PostDetailModal.tsx`

  **EXACT INSTRUCTIONS**: Add the CommentSection below the post content inside the modal. Replace the ENTIRE `<DialogContent>` block from T013 with this definitive structure:

  Add import: `import { CommentSection } from '@/modules/community/components/comments';`

  ```tsx
  <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
    <DialogHeader className="shrink-0 px-4 pt-4 pb-0">
      <DialogTitle className="sr-only">{post.title}</DialogTitle>
    </DialogHeader>
    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
      <PostDetailHeader post={post} />
      <h2 className="text-lg font-semibold">{post.title}</h2>
      <PostDetailContent
        content={post.content}
        attachments={post.attachments}
      />
      <PostDetailActions post={post} />
      <CommentSection postId={post.post_id} commentCount={post.comment_count} />
    </div>
  </DialogContent>
  ```

  **Layout explanation**:
  - `DialogContent` has `p-0 gap-0` — padding is handled by individual sections
  - `DialogHeader` is `shrink-0` so it stays fixed at top
  - The `flex-1 overflow-y-auto` div is the single scrollable area containing post + comments
  - `CommentInput` inside `CommentSection` uses `sticky bottom-0 bg-background` — this sticks to the bottom of the scrollable viewport because the parent has `overflow-y-auto`

  **DO NOT use any other layout structure. This is the only correct approach.**

**Checkpoint**: Users can now add comments via the modal. The comment appears immediately. Comment count syncs to feed.

---

## Phase 5: User Story 3 — View Comments List (Priority: P1)

**Goal**: Comments load below post content showing author avatar, name, timestamp, content. Empty state shown when no comments. Replies show "replying to" indicator. Edited comments show "(edited)".

**Independent Test**: Open a post with existing comments → all comments render with correct author info, timestamps. Open post with no comments → empty state message. Comments with replies show threading indicator.

### Implementation for User Story 3

- [x] T027 [US3] Create CommentSkeleton at `modules/community/components/comments/components/comment-skeleton/CommentSkeleton.tsx`

  **EXACT INSTRUCTIONS**: Loading skeleton for comments.
  - `'use client'` directive
  - Show 3 skeleton comment items, each with:
    - Circle (32x32) + name line + date line (avatar area)
    - 2 content lines (varying widths)
    - Small action area placeholder
  - Use `animate-pulse` on `bg-muted rounded` divs

  Also create `modules/community/components/comments/components/comment-skeleton/index.ts`.

- [x] T028 [US3] Create CommentItem component at `modules/community/components/comments/components/comment-item/CommentItem.tsx`

  **EXACT INSTRUCTIONS**: Displays a single comment with author info, content, timestamp, and action buttons.
  - `'use client'` directive
  - Props: `CommentItemProps` from `../../types`
  - Use `useTranslations('PostDetail')`
  - Use `useLocale()` from `next-intl`
  - Layout:
    ```
    <div className={cn('flex gap-3', isReply && 'ms-10')}>
      <avatar 32x32>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{author.name}</span>
          <span className="text-muted-foreground text-xs">{relativeTime}</span>
          {is_edited && <span className="text-muted-foreground text-xs">{t('comments.edited')}</span>}
        </div>
        {isEditing ? (
          <EditForm />
        ) : (
          <p className="text-sm mt-1 whitespace-pre-wrap">{content}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <LikeButton />
          {!isReply && <ReplyButton />}
          {isOwnComment && <OptionsMenu />}
        </div>
      </div>
    </div>
    ```
  - Avatar: Use same pattern as PostCard (initials with color palette, or Image if avatar_url exists). Import `AVATAR_PALETTE`, `getAvatarColorIndex` from `@/modules/community/components/post-card/constants`.
  - Relative time: Use `formatDistanceToNow` from `date-fns` with locale support
  - If `isEditing` (matches this comment): show inline textarea with current content, Save and Cancel buttons
  - Like button: small `Heart` icon (16x16) + count. Filled red if liked.
  - Reply button: only on top-level comments (`!isReply`). Text button "Reply".
  - Options menu (edit/delete): Only if `currentUserId === comment.author.id`. Use a simple dropdown or two icon buttons (Pencil, Trash2 from lucide-react).
  - For deleted author (author.id === null): show "Deleted user" name, no link
  - `isReply` prop adds `ms-10` (margin-start) indentation

  Also create `modules/community/components/comments/components/comment-item/index.ts`.

- [x] T029 [US3] Create CommentList component at `modules/community/components/comments/components/comment-list/CommentList.tsx`

  **EXACT INSTRUCTIONS**: Renders the list of comments with their replies.
  - `'use client'` directive
  - Props: `CommentListProps` from `../../types`
  - Use `useTranslations('PostDetail')`
  - Structure:
    ```tsx
    <div className="space-y-4">
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="text-primary text-sm hover:underline disabled:opacity-50"
        >
          {isLoading ? '...' : t('comments.loadMore')}
        </button>
      )}
      {comments.map((comment) => (
        <div key={comment.comment_id} className="space-y-3">
          <CommentItem
            comment={comment}
            isReply={false}
            currentUserId={currentUserId}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleLike={onToggleLike}
            isEditing={editingCommentId === comment.comment_id}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
          />
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.comment_id}
              comment={reply}
              isReply={true}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleLike={onToggleLike}
              isEditing={editingCommentId === reply.comment_id}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </div>
      ))}
    </div>
    ```
  - "Load more" button at the TOP (oldest-first ordering — older comments load at top)
  - Each top-level comment is followed by its replies (indented via `isReply`)
  - Reply button NOT shown on reply items (no `onReply` prop passed)

  Also create `modules/community/components/comments/components/comment-list/index.ts`.

- [x] T030 [US3] Replace placeholder in CommentSection with CommentList — modify `modules/community/components/comments/CommentSection.tsx`

  **EXACT INSTRUCTIONS**: Replace the `<div>Comments list placeholder</div>` with the real CommentList component:

  ```tsx
  <CommentList
    comments={comments}
    currentUserId={user?.id ?? null}
    onReply={setReplyingTo}
    onEdit={editComment}
    onDelete={deleteComment}
    onToggleLike={toggleCommentLike}
    editingCommentId={editingCommentId}
    onStartEdit={startEdit}
    onCancelEdit={cancelEdit}
    hasMore={hasMore}
    isLoading={isLoading}
    onLoadMore={loadMore}
  />
  ```

  Import `CommentList` from `./components/comment-list`.
  Import `CommentSkeleton` from `./components/comment-skeleton`.

**Checkpoint**: Comments now display with full author info, timestamps, edit indicators, and threading. All three P1 stories are functional.

---

## Phase 6: User Story 4 — Edit Own Comment (Priority: P2)

**Goal**: Comment authors can edit their own comments via inline editing. Edited comments show "(edited)" indicator.

**Independent Test**: Find own comment → click edit → text becomes editable → modify → save → see updated text + "(edited)" label. Click cancel → original text restored.

### Implementation for User Story 4

- [x] T031 [US4] Already implemented — verify edit flow works end-to-end

  **EXACT INSTRUCTIONS**: The edit functionality is already wired in through:
  - `useCommentSection.editComment()` — optimistic edit + server call (T023)
  - `CommentItem` inline edit form — shows when `isEditing` is true (T028)
  - `startEdit` / `cancelEdit` state management (T023)

  **Verify these work together**: When the Edit button is clicked on an owned comment, the `startEdit(commentId)` function sets `editingCommentId`, the `CommentItem` renders an inline textarea with Save/Cancel buttons, and on Save it calls `editComment(commentId, newContent)`.

  If there's a bug or gap in the inline edit form rendering inside CommentItem (T028), fix it now. The inline edit form should:
  - Show a `<textarea>` pre-filled with `comment.content`
  - Show Save (`t('commentActions.save')`) and Cancel (`t('commentActions.cancel')`) buttons
  - On Save: call `onEdit(comment.comment_id, newContent)` then `onCancelEdit()`
  - On Cancel: call `onCancelEdit()`
  - Validate content is 1-2000 chars before save

  **This task is a verification/fix task, not new code.**

---

## Phase 7: User Story 5 — Delete Own Comment (Priority: P2)

**Goal**: Comment authors can delete their own comments with confirmation dialog. Deleting a parent cascades replies.

**Independent Test**: Own comment → click delete → confirmation dialog → confirm → comment removed from list. Comment count decreases.

### Implementation for User Story 5

- [x] T032 [US5] Add delete confirmation to CommentItem — modify `modules/community/components/comments/components/comment-item/CommentItem.tsx`

  **EXACT INSTRUCTIONS**: The delete button in CommentItem should trigger an AlertDialog confirmation before calling `onDelete`.

  Add imports:

  ```typescript
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
  ```

  Wrap the delete button with AlertDialog:

  ```tsx
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button className="..." aria-label={t('commentActions.delete')}>
        <Trash2 className="h-4 w-4" />
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
        <AlertDialogDescription>
          {t('deleteConfirm.message')}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{t('deleteConfirm.cancel')}</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={() => onDelete(comment.comment_id)}
        >
          {t('deleteConfirm.confirm')}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  ```

  The actual delete logic (optimistic removal, cascade count, server call) is already handled in `useCommentSection.deleteComment()` from T023.

---

## Phase 8: User Story 6 — Like a Comment (Priority: P2)

**Goal**: Logged-in users can toggle likes on comments with optimistic updates.

**Independent Test**: Click like on a comment → count increments + heart fills immediately. Click again → count decrements + heart unfills.

### Implementation for User Story 6

- [x] T033 [US6] Already implemented — verify like toggle works end-to-end

  **EXACT INSTRUCTIONS**: The like functionality is already wired:
  - `useCommentSection.toggleCommentLike()` — optimistic toggle + server call (T023)
  - `CommentItem` like button — renders Heart icon with filled state (T028)

  **Verify**: When the Heart button is clicked, `onToggleLike(commentId)` is called, the comment's `is_liked` toggles and `like_count` updates optimistically. On server failure, state reverts and error toast shows.

  The like button in CommentItem (T028) should:
  - Show `Heart` icon (filled red if `comment.is_liked`)
  - Show `comment.like_count` next to it
  - Call `onToggleLike(comment.comment_id)` on click
  - Be disabled during pending state (use a local `likeInFlight` ref to prevent rapid clicks)

  If missing the debounce/inflight guard, add it now.

  **This task is a verification/fix task, not new code.**

---

## Phase 9: User Story 7 — Reply to a Comment (Priority: P3)

**Goal**: Users can reply to top-level comments. Reply shows "Replying to [name]" indicator and is linked to parent.

**Independent Test**: Click reply on comment → "Replying to [name]" indicator shown → submit → reply appears under parent comment.

### Implementation for User Story 7

- [x] T034 [US7] Already implemented — verify reply flow works end-to-end

  **EXACT INSTRUCTIONS**: The reply functionality is already wired:
  - `useCommentSection.addComment(content, parentCommentId)` — handles reply creation (T023)
  - `setReplyingTo(commentId, authorName)` / `cancelReply()` — reply state (T023)
  - `CommentInput` shows "Replying to {name}" indicator (T024)
  - `CommentItem` reply button calls `onReply(commentId, authorName)` (T028)
  - Reply button only on top-level comments (T029)

  **Verify the complete flow**:
  1. Click Reply on a comment → `setReplyingTo` sets state
  2. CommentInput shows "Replying to {name}" with dismiss X
  3. Submit → `addComment(content, replyingTo.commentId)` called
  4. New reply appears under the parent comment in the list
  5. Reply indicator clears after submit

  **This task is a verification/fix task, not new code.**

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, RTL, performance, and edge case handling.

- [x] T035 [P] Ensure full keyboard accessibility in modal and comment components

  **EXACT INSTRUCTIONS**: Verify and fix:
  - Dialog: Radix handles focus trap, Escape close, and ARIA automatically — verify it works
  - All buttons have `aria-label` or visible text
  - Comment like buttons: `aria-pressed` attribute reflecting state
  - Tab order: Header → Content → Action Bar → Comments → Comment Input
  - Focus visible states: all interactive elements have `focus-visible:ring-2` class
  - Edit mode: focus textarea when entering edit mode (`useEffect` with `ref.focus()`)

- [x] T036 [P] Audit and fix RTL layout in all new files

  **EXACT INSTRUCTIONS**: Open each of the following files and **fix** any LTR-only classes. This is NOT just a review — you must make edits where needed.

  **Files to audit** (every new file created in this feature):
  1. `components/ui/dialog.tsx` — Ensure close button uses `end-4` not `right-4`. Content uses `start-[50%]` and `rtl:-translate-x-[-50%]`.
  2. `modules/community/components/post-detail-modal/PostDetailModal.tsx` — No LTR-specific layout.
  3. `modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx` — Avatar+text gap uses `gap-3` (fine). Author link works RTL.
  4. `modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent.tsx` — Image grid uses CSS grid (fine).
  5. `modules/community/components/post-detail-modal/components/post-detail-actions/PostDetailActions.tsx` — Share/bookmark `ms-auto` not `ml-auto`.
  6. `modules/community/components/comments/components/comment-item/CommentItem.tsx` — Reply indentation MUST use `ms-10` (not `ml-10`). Options menu alignment uses `ms-auto`.
  7. `modules/community/components/comments/components/comment-input/CommentInput.tsx` — Send button positioned at `end` side. Reply dismiss X at `end` side.
  8. `modules/community/post-detail/PostDetailView.tsx` — Back arrow: use `ArrowLeft` for LTR, but in RTL the `<Link>` component's `flex` + `gap` handles direction automatically. The arrow icon itself does NOT need to flip (Tailwind handles `inline-flex` direction via `dir` attribute on `<html>`). Verify visually.

  **Common RTL fixes**:
  - `ml-*` → `ms-*` (margin-inline-start)
  - `mr-*` → `me-*` (margin-inline-end)
  - `pl-*` → `ps-*` (padding-inline-start)
  - `pr-*` → `pe-*` (padding-inline-end)
  - `left-*` → `start-*`
  - `right-*` → `end-*`
  - `text-left` → `text-start`
  - `text-right` → `text-end`

- [x] T037 [P] Verify full-page post detail view renders correctly with comments

  **EXACT INSTRUCTIONS**: The full-page `PostDetailView` (T016) already includes `CommentSection` and inherits `PostDetailProvider` from the `(main)` layout (T006). This is a verification task:
  1. Navigate directly to `/community/[postId]` — verify post renders server-side (view page source to confirm HTML is present)
  2. Verify CommentSection loads and functions (add, edit, delete, like, reply)
  3. Verify "Back to community" link works
  4. Verify the page works for both authenticated and unauthenticated users (comment input hidden for unauthed)
  5. If any issues found, fix them in the relevant component files

- [x] T038 Run `npm run check` and fix all lint/type/format errors

  **EXACT INSTRUCTIONS**: Run `npm run check` which runs format check, lint, and type-check. Fix any errors. Common issues:
  - Missing imports
  - Unused variables
  - Type mismatches
  - Formatting issues (run `npm run format` to fix)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001, T004)
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 3 (modal must exist to add comment section)
- **Phase 5 (US3)**: Depends on Phase 4 (CommentSection must exist)
- **Phase 6 (US4)**: Depends on Phase 5 (CommentItem must exist) — verification only
- **Phase 7 (US5)**: Depends on Phase 5 (CommentItem must exist)
- **Phase 8 (US6)**: Depends on Phase 5 — verification only
- **Phase 9 (US7)**: Depends on Phase 5 — verification only
- **Phase 10 (Polish)**: Depends on all prior phases

### Task Dependencies (Critical Path)

```
T001 → T004 → T006 → T008-T021 (US1) → T022-T026 (US2) → T027-T030 (US3)
T002, T003 can run in parallel with T001
T005, T007 can run in parallel with each other (both Phase 2)
T032 depends on T028 (US5 needs CommentItem)
T035, T036, T037, T038 can all run in parallel
```

### Parallel Opportunities

Within Phase 1: T002 and T003 are parallel (different files)
Within Phase 2: T005 and T007 are parallel (different files)
Within Phase 3 (US1): T008, T009, T010, T011 are parallel (different component files)
Within Phase 10: T035, T036, T037 are parallel (different concerns)

---

## Parallel Example: User Story 1 Components

```bash
# These can all be created in parallel (different files, no cross-dependencies):
T008: modules/community/components/post-detail-modal/types/index.ts
T009: modules/community/components/post-detail-modal/components/post-detail-skeleton/PostDetailSkeleton.tsx
T010: modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx
T011: modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent.tsx

# Then T012 can start (needs T010, T011 created but not T008/T009):
T012: modules/community/components/post-detail-modal/components/post-detail-actions/PostDetailActions.tsx

# Then T013 assembles them all:
T013: modules/community/components/post-detail-modal/PostDetailModal.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Dialog, routes, layout)
2. Complete Phase 2: Foundational (Context, i18n)
3. Complete Phase 3: User Story 1 (Modal + full post view)
4. **STOP and VALIDATE**: Click post cards → modal opens with full content. Close modal → return to feed. Direct URL → full-page view.
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (View post in modal) → Test → Deploy (MVP!)
3. US2 (Add comment) → Test → Deploy
4. US3 (View comments list) → Test → Deploy
5. US4-US7 (Edit, delete, like, reply) → Test → Deploy
6. Polish → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All server actions already exist — DO NOT modify `modules/community/actions.ts` or `modules/community/queries.ts`
- All types already exist — DO NOT recreate types that are in `modules/community/types/index.ts`
- Use `radix-ui` (NOT `@radix-ui/react-dialog`) — this project uses the unified radix-ui package v1.4.3
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `npm run check` frequently to catch errors early
