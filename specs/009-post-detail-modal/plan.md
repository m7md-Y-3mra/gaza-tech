# Implementation Plan: Post Detail Modal

**Branch**: `009-post-detail-modal` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-post-detail-modal/spec.md`

## Summary

Implement a post detail modal that opens when users click a post card in the community feed, showing full post content and a complete comment system (view, add, edit, delete, like, reply). Uses Next.js intercepting routes (`@modal/(.)community/[postId]`) for URL-based modal with full-page fallback on direct navigation. All server actions/queries already exist; this is a frontend-only feature.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16 (App Router), React 19, `next-intl` ^4.7.0, `date-fns` ^4.1.0, `lucide-react` ^0.562.0, `sonner` ^2.0.7, shadcn/ui (radix), Tailwind CSS ^4  
**Storage**: N/A (consumes existing server actions — no new DB work)  
**Testing**: Manual acceptance testing per spec scenarios  
**Target Platform**: Web (SSR + CSR)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Modal open < 1s (SC-001), optimistic comment add < 1s (SC-002), edit/delete < 2s (SC-003)  
**Constraints**: WCAG AA, RTL/LTR support, Core Web Vitals 95%+  
**Scale/Scope**: Up to 100 comments per modal without degradation (SC-004), paginated at 20 per batch

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status | Notes                                                                                                                     |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| I. Module-First Architecture        | PASS   | All modal components live in `modules/community/components/`. Routes only wire URLs to module pages.                      |
| II. Server-First Rendering          | PASS   | Full-page fallback is a server component. Modal content uses client components only where interaction is needed.          |
| III. Incremental Staged Development | PASS   | Plan defines staged implementation: routing → modal shell → post detail → comments list → comment actions → enhancements. |
| IV. Performance Standards           | PASS   | Dialog uses Radix primitives (portal-rendered). Comments paginated at 20. Optimistic updates for responsiveness.          |
| V. Accessibility (WCAG AA)          | PASS   | Radix Dialog handles focus trap, Escape close, ARIA roles. Keyboard navigation for all interactive elements.              |
| VI. Consistent Error Handling       | PASS   | All server actions already wrapped with `errorHandler()`. Comment form uses zod + react-hook-form.                        |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/009-post-detail-modal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
# New files for this feature:

components/ui/
└── dialog.tsx                                    # shadcn Dialog component (Radix primitive)

app/[locale]/(main)/
├── layout.tsx                                    # Updated: accept `modal` slot prop
├── @modal/
│   ├── default.tsx                               # Returns null (no modal open)
│   └── (.)community/
│       └── [postId]/
│           └── page.tsx                          # Intercepting route → modal view
└── community/
    └── [postId]/
        └── page.tsx                              # Full-page fallback for direct navigation

modules/community/
├── components/
│   ├── post-detail-modal/
│   │   ├── PostDetailModal.tsx                   # Modal shell (Dialog wrapper)
│   │   ├── index.ts
│   │   ├── types/index.ts
│   │   └── components/
│   │       ├── post-detail-header/
│   │       │   └── PostDetailHeader.tsx          # Author, date, category badge
│   │       ├── post-detail-content/
│   │       │   └── PostDetailContent.tsx         # Full post body + attachments
│   │       ├── post-detail-actions/
│   │       │   └── PostDetailActions.tsx         # Like, bookmark, share bar
│   │       └── post-detail-skeleton/
│   │           └── PostDetailSkeleton.tsx        # Loading skeleton
│   └── comments/
│       ├── CommentSection.tsx                    # Comments container (list + input)
│       ├── index.ts
│       ├── types/index.ts
│       ├── hooks/
│       │   └── useCommentSection.ts              # Comment state management
│       └── components/
│           ├── comment-item/
│           │   ├── CommentItem.tsx               # Single comment display
│           │   ├── hooks/useCommentItem.ts       # Edit/delete/like logic
│           │   └── index.ts
│           ├── comment-input/
│           │   ├── CommentInput.tsx              # Sticky input with reply indicator
│           │   ├── hooks/useCommentInput.ts      # Submit/reply logic
│           │   └── index.ts
│           ├── comment-list/
│           │   ├── CommentList.tsx               # Scrollable list with "Load more"
│           │   └── index.ts
│           └── comment-skeleton/
│               └── CommentSkeleton.tsx           # Loading skeleton for comments
├── post-detail/
│   ├── PostDetailPage.tsx                        # Full-page post detail (server component)
│   └── index.ts
```

**Structure Decision**: Modal components live in `modules/community/components/post-detail-modal/` and `modules/community/components/comments/`. The full-page fallback page lives in `modules/community/post-detail/`. Routes under `app/` are thin wrappers per constitution rules.
