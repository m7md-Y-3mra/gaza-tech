# Implementation Plan: Community Post Form UI

**Branch**: `004-community-post-form-ui` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-community-post-form-ui/spec.md`

## Summary

Build the Create/Update Community Post form page following the existing listings form pattern (Server Component → Client Component). Includes route pages, a server component that fetches post data for edit mode, a client form component with title/category/content/attachments fields, a `usePostForm` hook for form logic, and a `CategoryRadioField` component. Single-column centered layout, no sidebar. All strings translatable (en + ar).

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16, React 19, react-hook-form ^7.69.0, zod ^4.2.1, @hookform/resolvers/zod, next-intl ^4.7.0, shadcn/ui (radix), lucide-react, sonner  
**Storage**: Supabase PostgreSQL (`community_posts`, `community_posts_attachments`); Supabase Storage bucket `community-attachments`  
**Testing**: Manual smoke testing (no automated test framework in project)  
**Target Platform**: Web (Next.js SSR/SSG, all modern browsers)  
**Project Type**: Web application (Next.js)  
**Performance Goals**: LCP < 2.5s, FID < 100ms, CLS < 0.1, Lighthouse ≥ 95%  
**Constraints**: WCAG AA accessibility, RTL support (Arabic), no client-side data fetching for initial render  
**Scale/Scope**: Single form with 4 fields + file upload, 2 routes (create + edit), ~12 new files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                                | Status  | Notes                                                                                       |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| I. Module-First Architecture        | ✅ PASS | All new code lives in `modules/community/`. Routes only wire URLs to module pages.          |
| II. Server-First Rendering          | ✅ PASS | Server component fetches data; `'use client'` only for form interactivity.                  |
| III. Incremental Staged Development | ✅ PASS | Plan splits work into small staged commits (design → logic → enhancement).                  |
| IV. Performance Standards           | ✅ PASS | Single-column form, no heavy client components. File upload uses existing shared component. |
| V. Accessibility (WCAG AA)          | ✅ PASS | Semantic HTML, keyboard navigation, proper labels, focus states planned.                    |
| VI. Consistent Error Handling       | ✅ PASS | Uses existing `errorHandler()`, react-hook-form + zod, `TextField`/custom field components. |
| Code Quality Gate                   | ✅ PASS | All changes will pass `npm run check`. Conventional Commits.                                |

No violations. No complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-community-post-form-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# Route pages
app/[locale]/(main)/community/
├── create/
│   └── page.tsx                              # Create route → CreatePostPage
└── [postId]/
    └── edit/
        └── page.tsx                          # Edit route → UpdatePostPage

# Module structure
modules/community/
├── types/index.ts                            # (exists) add PostFormInitialData
├── schema.ts                                 # (exists) no changes
├── server-schema.ts                          # (exists) no changes
├── actions.ts                                # (exists) no changes
├── queries.ts                                # (exists) no changes
├── create-post/
│   ├── CreatePostPage.tsx                    # Module page (ErrorBoundary + Suspense + PostForm)
│   └── index.ts                              # Barrel export
├── update-post/
│   ├── UpdatePostPage.tsx                    # Module page (ErrorBoundary + Suspense + PostForm)
│   └── index.ts                              # Barrel export
└── components/
    └── post-form/
        ├── PostForm.tsx                      # Server component (fetches data, renders client)
        ├── PostFormClient.tsx                # Client component (form UI)
        ├── PostFormSkeleton.tsx              # Loading skeleton
        ├── PostFormError.tsx                 # Error fallback
        ├── constant.ts                       # Default values helper
        ├── types/index.ts                    # PostFormClientProps, PostFormInitialData
        ├── hooks/
        │   └── usePostForm.ts                # Form logic hook
        ├── components/
        │   └── category-radio-field/
        │       ├── CategoryRadioField.tsx    # 2×2 radio grid for post categories
        │       └── index.ts
        └── index.ts                          # Barrel export

# Shared component (new)
components/text-area-field/
├── TextAreaField.tsx                         # Reusable textarea field (like TextField but textarea)
└── index.ts

# Translation files (existing, updated)
messages/en.json                              # Add PostForm.*, Metadata.createPost/editPost keys
messages/ar.json                              # Add PostForm.*, Metadata.createPost/editPost keys
```

**Structure Decision**: Follows the existing module-first pattern established by `modules/listings/`. The `create-post/` and `update-post/` folders mirror `create-listing/` and `update-listing/`. The `post-form/` component mirrors `listing-form/`. The `TextAreaField` is placed in shared `components/` since the existing `TextField` does not support textarea rendering — this fills a gap needed by both community and potentially other modules.
