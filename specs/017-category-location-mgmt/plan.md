# Implementation Plan: Category and Location Management

**Branch**: `017-category-location-mgmt` | **Date**: 2026-04-15 | **Spec**: [specs/017-category-location-mgmt/spec.md](spec.md)
**Input**: Feature specification from `/specs/017-category-location-mgmt/spec.md`

## Summary

Implement an administrative management interface for product categories and location entries within the dashboard. This includes CRUD operations, validation for uniqueness, search/filtering, and protection against deleting entities that are currently in use by active listings.

## Technical Context

**Language/Version**: Next.js 15+, TypeScript 5+
**Primary Dependencies**: Supabase, next-intl, zod, react-hook-form, shadcn/ui, lucide-react, @tanstack/react-table
**Storage**: PostgreSQL (via Supabase)
**Testing**: `npm run check` (lint, format, type-check)
**Target Platform**: Web (Next.js)
**Project Type**: Web Application (Dashboard Module)
**Performance Goals**: Core Web Vitals (LCP < 2.5s, CLS < 0.1), Search/Filter < 500ms
**Constraints**: WCAG AA Accessibility, RBAC (Admin only), Module-First Architecture
**Scale/Scope**: Admin management pages for 2 main entities (Category, Location)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

1. **Module-First Architecture**: Features will be contained in `modules/category-location/`.
2. **Server-First Rendering**: Pages will use Server Components for initial data fetching; client components for interactive tables and forms.
3. **Incremental Staged Development**: Implementation will be broken into Phase 0 (Research), Phase 1 (Design), Phase 2 (Data Layer), Phase 3 (UI), Phase 4 (Enhancements).
4. **Performance Standards**: Minimal impact on Core Web Vitals; efficient data fetching with Supabase.
5. **Accessibility**: Use semantic HTML and Shadcn/UI primitives for accessibility.
6. **Consistent Error Handling**: All actions will be wrapped with `errorHandler()`.

## Project Structure

### Documentation (this feature)

```text
specs/017-category-location-mgmt/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
app/[locale]/dashboard/management/
└── page.tsx              # Dashboard management page entry

modules/category-location/
├── types/                # Category/Location types
├── queries.ts            # Database queries (getCategories, getLocations)
├── actions.ts            # Server actions for CRUD (wrapped with errorHandler)
├── schema.ts             # Zod validation schemas
├── components/           # Reusable components across the module
│   ├── categories-table/ # Categories data table
│   ├── locations-table/  # Locations data table
│   └── forms/            # Category/Location forms
└── management-page/      # Page-specific components
    ├── CategoryLocationPage.tsx
    └── index.ts
```

**Structure Decision**: Single project layout with a dedicated module `modules/category-location/` following the project's non-negotiable architectural rules.

## Complexity Tracking

_No violations detected._
