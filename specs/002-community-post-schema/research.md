# Research: Community Post Schema

**Date**: 2026-04-01
**Feature**: 002-community-post-schema

## R-001: Schema Factory Pattern

**Decision**: Follow the existing listings module pattern — factory functions accepting `TranslationFunction` returning Zod schemas.

**Rationale**: The project already has this pattern established in `modules/listings/schema.ts`. Consistency reduces cognitive load and ensures the same form integration works (react-hook-form + zodResolver).

**Alternatives considered**:

- Static schemas with separate i18n layer → rejected (breaks existing `useTranslations` integration pattern)
- Schema-per-locale files → rejected (duplication, harder maintenance)

## R-002: Zod 4 Compatibility

**Decision**: Use Zod 4.x API (`z.file()`, `z.string().url()`, `.mime()`, `.default()`) which is already in use across the project (v4.3.6 installed).

**Rationale**: The project already uses Zod 4 features like `z.file()` and `.mime()` in the listings schema. No migration needed.

**Alternatives considered**:

- Zod 3.x API → not applicable, project already on Zod 4

## R-003: Database Table Structure

**Decision**: Use existing Supabase-generated types from `types/supabase.ts`. Both `community_posts` and `community_posts_attachments` tables exist with stable schemas.

**Rationale**: Tables already defined in Supabase with proper relationships (post→author via `author_id`, attachment→post via `post_id`).

**Key fields**:

- `community_posts`: post_id, author_id, title, content, post_category, content_status, published_at, created_at, updated_at
- `community_posts_attachments`: attachment_id, post_id, file_url, created_at

## R-004: File Validation for Community Attachments

**Decision**: Create community-specific file constants (5MB max, JPEG/PNG/GIF/WebP/PDF) separate from the existing image-file constants (2MB max, images only).

**Rationale**: Community posts allow PDFs and have a higher size limit (5MB vs 2MB). Reusing `constants/image-file.ts` would require modifying shared constants that listings depend on.

**Alternatives considered**:

- Extend existing image-file constants → rejected (different MIME types and size limits)
- Parameterized shared constant function → rejected (over-engineering for two use cases)

## R-005: Translation Key Namespace

**Decision**: Use `CommunityForm.validation` namespace in messages JSON, following the `ListingForm.validation` pattern.

**Rationale**: Consistent with existing convention. Keeps community validation messages grouped and separate from listing messages.

## R-006: Type Export Pattern

**Decision**: Export database-derived types (Row, Insert, Update) from `modules/community/types/index.ts` using the same pattern as listings: `Database['public']['Tables']['community_posts']['Row']` etc.

**Rationale**: Matches existing listings pattern in `modules/listings/types/index.ts`. Provides compile-time safety with Supabase-generated types.

## R-007: Update Schema Attachment Union

**Decision**: Use `z.union([z.file(), z.string().url()])` for update schema attachments to accept both new File uploads and existing URL strings.

**Rationale**: Clarified in spec session — existing URLs validated as valid URL format. Union type allows mixed arrays while maintaining type safety for both cases.
