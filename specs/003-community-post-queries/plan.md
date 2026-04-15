# Implementation Plan: Community Post Queries & Server Actions

**Branch**: `003-community-post-queries` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-community-post-queries/spec.md`

## Summary

Implement Supabase query functions and server actions for community post CRUD operations (create, update, get details). Follows the established listings module pattern: raw queries in `queries.ts` validated with Zod server schemas, wrapped with `errorHandler()` in `actions.ts`. Attachments are stored in a separate `community_posts_attachments` table. Create includes rollback on attachment failure; update uses true attachment diff (add new, delete removed).

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16, React 19  
**Primary Dependencies**: `@supabase/supabase-js` ^2.86.0, `zod` ^4.2.1, `next-intl` ^4.7.0  
**Storage**: Supabase PostgreSQL (`community_posts`, `community_posts_attachments` tables); Supabase Storage bucket `community-attachments`  
**Testing**: Manual testing via form UI (Phase 4); server action response validation  
**Target Platform**: Web (server-side Node.js runtime)  
**Project Type**: Web application (Next.js full-stack)  
**Performance Goals**: Create/update < 3s, details fetch < 1s  
**Constraints**: All actions must use `errorHandler()` wrapper; auth via `authHandler()`; ownership check on updates  
**Scale/Scope**: Single module, 2 new files (`queries.ts`, `actions.ts`), 1 new file (`server-schema.ts`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                                    | Status | Notes                                                                                                         |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| **I. Module-First Architecture**        | PASS   | All code lives in `modules/community/` with proper separation: `queries.ts`, `actions.ts`, `server-schema.ts` |
| **II. Server-First Rendering**          | PASS   | All queries and actions are server-only; no client-side data fetching                                         |
| **III. Incremental Staged Development** | PASS   | Plan breaks work into 3 isolated stages (server schema, queries, actions)                                     |
| **IV. Performance Standards**           | N/A    | Backend-only phase; no UI rendering impact                                                                    |
| **V. Accessibility**                    | N/A    | No UI in this phase                                                                                           |
| **VI. Consistent Error Handling**       | PASS   | All actions wrapped with `errorHandler()`; server-side Zod validation via `zodValidation()`                   |
| **Code Quality Gate**                   | PASS   | `npm run check` will be run after each stage                                                                  |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-community-post-queries/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
modules/community/
├── types/
│   └── index.ts          # Already exists (Phase 2)
├── schema.ts             # Already exists (Phase 2 — client schemas)
├── server-schema.ts      # NEW — server-side validation schemas
├── queries.ts            # NEW — Supabase query functions
└── actions.ts            # NEW — errorHandler-wrapped server actions
```

**Structure Decision**: All new files go inside the existing `modules/community/` directory following the module-first architecture. No new directories needed — `queries.ts` and `actions.ts` live at the module root, matching the `modules/listings/` pattern exactly.
