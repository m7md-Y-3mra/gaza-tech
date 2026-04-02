# Implementation Plan: Community Post Schema

**Branch**: `002-community-post-schema` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-community-post-schema/spec.md`

## Summary

Define Zod validation schemas and TypeScript types for community post create/update forms. Follows the established schema factory pattern (translation-injected factories, react-hook-form integration, Supabase-derived types). Covers title, content, category, and mixed-type attachment validation.

## Technical Context

**Language/Version**: TypeScript, Next.js 16, React 19
**Primary Dependencies**: zod ^4.2.1, react-hook-form ^7.69.0, @hookform/resolvers/zod, next-intl ^4.7.0, @supabase/supabase-js ^2.86.0
**Storage**: Supabase PostgreSQL (tables: `community_posts`, `community_posts_attachments`); Supabase Storage bucket: `community-attachments`
**Testing**: TypeScript type-check (`npm run type-check`), manual form testing
**Target Platform**: Web (Next.js SSR/SSG)
**Project Type**: Web application (Next.js)
**Performance Goals**: N/A (schema-only, no runtime UI impact)
**Constraints**: Must follow existing schema factory pattern; Zod 4 API; i18n via next-intl
**Scale/Scope**: 2 schema factories, ~12 type exports, 2 translation namespaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module-First Architecture | ✅ PASS | New module at `modules/community/` with `types/` and `schema.ts` |
| II. Server-First Rendering | ✅ PASS | Schemas are isomorphic (no client/server concern); types are pure TS |
| III. Incremental Staged Development | ✅ PASS | Implementation will be staged: types → constants → create schema → update schema → i18n |
| IV. Performance Standards | ✅ PASS | No UI components; no performance impact |
| V. Accessibility (WCAG AA) | ✅ PASS | No UI components in this feature |
| VI. Consistent Error Handling | ✅ PASS | Schema factories produce translated validation messages; follows errorHandler pattern |

**Gate Result**: ALL PASS — proceed to Phase 0.

### Post-Phase 1 Re-check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module-First Architecture | ✅ PASS | Types in `modules/community/types/`, schema in `modules/community/schema.ts`, constants in `constants/` |
| II. Server-First Rendering | ✅ PASS | No components created |
| III. Incremental Staged Development | ✅ PASS | 4 discrete stages planned |
| IV–V. Performance/Accessibility | ✅ N/A | Schema-only feature |
| VI. Consistent Error Handling | ✅ PASS | TranslationFunction pattern + zodResolver integration |

**Gate Result**: ALL PASS — proceed to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-community-post-schema/
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
│   └── index.ts         # DB types, form types, enums (PostCategory, FormMode)
└── schema.ts            # Schema factories + static schema exports

constants/
└── community-file.ts    # MAX_COMMUNITY_UPLOAD_SIZE, ACCEPTED_COMMUNITY_FILE_TYPES, MAX_COMMUNITY_ATTACHMENTS

messages/
├── en.json              # CommunityForm.validation.* keys (English)
└── ar.json              # CommunityForm.validation.* keys (Arabic)
```

**Structure Decision**: Follows module-first architecture. Community module created under `modules/community/` with only the files needed for this schema feature. Constants placed in global `constants/` since they may be referenced by the reusable file upload component.

## Complexity Tracking

No constitution violations — no entries needed.
