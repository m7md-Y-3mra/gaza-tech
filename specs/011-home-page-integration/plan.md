# Implementation Plan: Home Page Integration

**Branch**: `011-home-page-integration` | **Date**: 2026-04-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-home-page-integration/spec.md`

## Summary

Transform the home page from a listings-only page into a mixed landing page connecting both marketplace and community sections, featuring 4 recent listings and 3 recent community posts, each utilizing independent error isolation, Suspense boundaries, and 60-second ISR caching.

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js 16  
**Primary Dependencies**: Supabase, Tailwind CSS 4, shadcn/ui, next-intl  
**Storage**: PostgreSQL (Supabase) via existing server actions  
**Testing**: ESLint, Prettier, TypeScript Type Checks  
**Target Platform**: Web Browser (Responsive Desktop & Mobile)  
**Project Type**: Next.js Web Application  
**Performance Goals**: LCP < 2.5s, FID < 100ms, CLS < 0.1, utilizing 60s ISR  
**Constraints**: Independent Error Boundaries and Suspense per section  
**Scale/Scope**: Max 7 data nodes rendered; lightweight UI

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Module-First Architecture**: PASS. Logic housed in `modules/home/`.
- **Server-First Rendering**: PASS. Server Components used for initial data fetching and rendering.
- **Performance Standards**: PASS. ISR revalidation implemented for optimal LCP.
- **Consistent Error Handling**: PASS. Relies on standard Error Boundaries in Next.js plus `errorHandler()` for action logic (if applicable).

## Project Structure

### Documentation (this feature)

```text
specs/011-home-page-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
app/
└── [locale]/
    └── (main)/
        └── page.tsx

modules/
└── home/
    ├── components/
    │   ├── latest-listings/
    │   │   ├── LatestListings.tsx
    │   │   ├── LatestListingsSkeleton.tsx
    │   │   └── index.ts
    │   └── community-highlights/
    │       ├── CommunityHighlights.tsx
    │       ├── CommunityHighlightsSkeleton.tsx
    │       └── index.ts
    ├── HomePage.tsx
    └── index.ts
```

**Structure Decision**: A new `home/` module is created strictly for Home Page specific components. The root `app/[locale]/(main)/page.tsx` connects the route to the module.

## Complexity Tracking

_No constitution violations have been identified._
