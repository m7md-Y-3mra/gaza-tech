# Implementation Plan: Reusable File Upload Component

**Branch**: `001-reusable-file-upload` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-reusable-file-upload/spec.md`

## Summary

Extract a shared, configuration-driven file upload component from the existing listings image upload (`modules/listings/.../image-upload/`). The shared component lives in `components/file-upload/` and supports two display modes: **image-grid** (listings: thumbnails, reorder, compression) and **file-list** (community: mixed file types, inline image previews, file-type icons). The existing listings upload is refactored to use the shared component internally with zero behavioral change.

## Technical Context

**Language/Version**: TypeScript, Next.js 16, React 19
**Primary Dependencies**: react-hook-form `^7.69.0`, zod `^4.2.1`, `@supabase/supabase-js` `^2.86.0`, browser-image-compression `^2.0.2`, next-intl `^4.7.0`, Tailwind CSS `^4`, shadcn/ui (radix), lucide-react
**Storage**: Supabase Storage (buckets: `marketplace-image` for listings, `community-attachments` for community)
**Testing**: Manual testing (create/edit listing flow, visual regression)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (Next.js)
**Performance Goals**: LCP < 2.5s, FID < 100ms, CLS < 0.1 (95% Core Web Vitals)
**Constraints**: WCAG AA compliance, RTL support (Arabic), incremental staged development
**Scale/Scope**: 2 consumers initially (listings, community), ~8 files in shared component

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status | Notes                                                                                                                                                        |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I. Module-First Architecture        | PASS   | Shared component in `components/file-upload/` (global shared). Listings module keeps its own integration wrapper. No duplication of global responsibilities. |
| II. Server-First Rendering          | PASS   | `'use client'` justified — component requires drag-drop, file input, browser APIs (`URL.createObjectURL`). No server data fetching in component.             |
| III. Incremental Staged Development | PASS   | Work broken into 5+ stages with explicit approval gates (enforced in tasks).                                                                                 |
| IV. Performance Standards           | PASS   | Client-only component loaded on form pages only. Image compression reduces upload size. ObjectURL previews avoid network requests.                           |
| V. Accessibility (WCAG AA)          | PASS   | Requires: keyboard-accessible file input, proper labels, `aria-live` error announcements, semantic list markup, visible focus states.                        |
| VI. Consistent Error Handling       | PASS   | File validation via zod schemas. Upload errors follow atomic rollback pattern. Per-file rejection messages via toast.                                        |

**No violations. No complexity tracking needed.**

### Post-Phase 1 Re-check

| Principle                    | Status | Notes                                                                                                              |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| I. Module-First Architecture | PASS   | Data model keeps types in `components/file-upload/types/` (shared), consumer-specific extensions in their modules. |
| II. Server-First Rendering   | PASS   | Only `FileUpload.tsx` needs `'use client'`. Hooks are client-only by nature.                                       |
| IV. Performance Standards    | PASS   | No heavy dependencies added. `browser-image-compression` uses WebWorker (off-thread).                              |
| V. Accessibility (WCAG AA)   | PASS   | Contract specifies keyboard-reachable interactions, proper ARIA, focus states.                                     |

## Project Structure

### Documentation (this feature)

```text
specs/001-reusable-file-upload/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: dependency research
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: usage examples
├── contracts/
│   └── file-upload-component.md  # Phase 1: component API contract
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
components/file-upload/              # NEW — shared component
├── FileUpload.tsx                   # Main UI ('use client')
├── index.ts                         # Barrel exports
├── types/
│   └── index.ts                     # FileUploadItem, Config, Result types
├── hooks/
│   ├── useFileUpload.ts             # State management (internal)
│   └── useFileUploader.ts           # Supabase upload/delete (public)
└── reducers/
    ├── fileReducer.ts               # ADD_FILES, REMOVE_FILE, SET_THUMBNAIL, REORDER_FILES
    └── index.ts

modules/listings/components/listing-form/
├── components/image-upload/
│   ├── ImageUpload.tsx              # REFACTORED — wrapper around FileUpload
│   ├── index.ts                     # Unchanged export surface
│   └── types/index.ts              # SIMPLIFIED — re-exports + listing extensions
├── hooks/useListingForm.ts          # UPDATED — import useFileUploader from shared
└── types/index.ts                   # UPDATED — use shared base types

constants/
├── image-file.ts                    # KEPT — listing-specific constants still used
└── listings.ts                      # KEPT — LISTING_BUCKET_NAME still used

schemas/
└── image-file.ts                    # KEPT — listing-specific validation schema
```

**Structure Decision**: The shared component follows the existing pattern in `components/` (alongside `text-field/`, `checkbox-field/`, etc.). The listings module is refactored to delegate to the shared component, maintaining its existing external API to avoid cascading changes to `ListingFormClient.tsx`.

## Key Design Decisions

### 1. Thumbnail on Base Type

The shared `FileUploadItemBase` type includes `isThumbnail: boolean`. In `image-grid` mode, the reducer manages thumbnail designation (first file auto-marked, toggleable by user). In `file-list` mode, `isThumbnail` is always `false` — it is present on the type but never set to `true`. This is simpler than a separate `ImageGridFileUploadItem` extension type and avoids generics in the reducer and hooks. The consumer (e.g., listings form hook) reads `isThumbnail` directly from the component's output.

### 2. Compression Guard

`useFileUploader.uploadFiles()` checks `file.type.startsWith('image/')` before calling `compressImage()`. This prevents `browser-image-compression` from throwing on non-image files (PDFs, etc.) when compression is enabled.

### 3. File Extension Handling

When compression is enabled and transforms to WebP, the generated storage path uses `.webp` extension. When compression is disabled, the original file extension is preserved. Extension is derived from `file.name` or `file.type`.

### 4. Listings Refactor Strategy

The existing `ImageUpload` component becomes a thin wrapper that:

1. Constructs a `FileUploadConfig` from existing constants
2. Renders `<FileUpload />` with `displayMode: 'image-grid'`
3. Maintains the same props interface (`mode`, `name`, `disabled`, `initialImages`)

This ensures zero changes needed in `ListingFormClient.tsx` beyond none (the import path stays the same).

### 5. Translation Namespace

The shared component uses its own translation namespace `FileUpload` (in `en.json`/`ar.json`). Listings-specific labels (e.g., "Cover") remain in `ListingForm.images` namespace and are passed to the shared component via config or slots if needed.
