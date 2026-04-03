# Research: Reusable File Upload Component

**Date**: 2026-03-29 | **Branch**: `001-reusable-file-upload`

## 1. Zod v4 File Validation

**Decision**: Use `z.file()` with `.min()`, `.max()`, `.mime()` chain — the existing pattern.

**Rationale**: `z.file()` is new in zod v4 (did not exist in v3). The installed version (`^4.2.1`) supports:

- `z.file().min(bytes, msg)` — minimum file size
- `z.file().max(bytes, msg)` — maximum file size
- `z.file().mime(types, msg)` — MIME type restriction

The `MimeTypes` type accepts standard MIME strings plus `(string & {})` for custom types. The existing `schemas/image-file.ts` already uses the correct API.

**Alternatives considered**: None needed — native zod v4 support is the right choice.

## 2. Supabase Storage Upload API

**Decision**: Use `supabase.storage.from(bucket).upload(path, file, options)` — the existing pattern, parameterized for bucket/path.

**Rationale**: Confirmed with `@supabase/storage-js@2.99.1`:

- `upload()` returns `{ data: { id, path, fullPath }, error: null } | { data: null, error: StorageError }`
- `getPublicUrl()` is **synchronous** — returns `{ data: { publicUrl } }`, no error field, constructs URL client-side
- `FileOptions`: `{ cacheControl?, contentType?, upsert?, metadata?, headers? }`
- **No progress callback** — `upload()` uses a single `fetch` call. Per-file progress would require `XMLHttpRequest` or `ReadableStream` wrapper (out of scope per clarification)

**Alternatives considered**: Generic upload callback (rejected — CHAT.md explicitly requires Supabase-specific with parameterized bucket/path).

## 3. browser-image-compression

**Decision**: Continue using `browser-image-compression@2.0.2` with existing options. Add file-type guard before calling.

**Rationale**:

- Returns `File` (extends `Blob`) — compatible with Supabase upload
- Options used: `maxSizeMB: 1`, `maxWidthOrHeight: 1920`, `fileType: 'image/webp'`, `useWebWorker: true`
- **Does NOT validate file type** — passing a non-image file will cause a generic image-loading error
- The shared `useFileUploader` must check `file.type.startsWith('image/')` before calling `compressImage()` when compression is enabled

**Alternatives considered**: None — library is stable, widely used, and already integrated.

## 4. Existing Implementation Analysis

**Decision**: Extract and generalize from `modules/listings/components/listing-form/components/image-upload/`.

**Key findings from codebase exploration**:

| Aspect         | Current (Listings)                 | Shared (Target)                           |
| -------------- | ---------------------------------- | ----------------------------------------- |
| Bucket         | `marketplace-image` (hardcoded)    | Configurable via `bucketName` param       |
| Path prefix    | `listings/` (hardcoded)            | Configurable via `pathPrefix` param       |
| Compression    | Always on, WebP output             | Configurable via `enableCompression` flag |
| Max files      | 5 (from constant)                  | Configurable via `maxFiles` param         |
| Max size       | 2MB (from constant)                | Configurable via `maxSizeBytes` param     |
| Accepted types | Images only                        | Configurable via `acceptedTypes` param    |
| Display        | Image grid only                    | Configurable: `image-grid` or `file-list` |
| Thumbnail      | Always enabled                     | Enabled only in `image-grid` mode         |
| Reorder        | Always enabled                     | Enabled only in `image-grid` mode         |
| Upload timing  | On form submit (deferred)          | Same — on form submit                     |
| Batch failure  | Atomic rollback (cleanup uploaded) | Same                                      |
| Progress       | Binary `isUploading` flag          | Same (per clarification)                  |

**Current architecture** (6 files):

- `ImageUpload.tsx` — UI with 5-column image grid, drop zone, count badge
- `hooks/useImageUpload.ts` — state management (add, remove, thumbnail, reorder, drag)
- `hooks/useImageUploader.ts` — Supabase upload/delete, compression, cleanup
- `reducers/imageReducer.ts` — 4 actions: ADD_IMAGES, REMOVE_IMAGE, SET_THUMBNAIL, REORDER_IMAGES
- `types/index.ts` — ImageFileUploadImage, ImageUploadProps
- `index.ts` — barrel exports

**Form integration pattern**: `useReducer` for local state, syncs to react-hook-form via `setValue(name, files)` in a `useEffect` on state changes.

## 5. Non-Image File Preview Strategy

**Decision**: In file-list mode, show inline thumbnail previews for image files, file-type icons for non-image files.

**Rationale**: Per clarification session. Image previews use `URL.createObjectURL()` (same mechanism as image-grid mode). Non-image files get a file-type icon based on MIME type (e.g., PDF icon for `application/pdf`).

**Implementation**: Check `file.type.startsWith('image/')` to determine preview strategy. Use `lucide-react` icons for file-type indicators (`FileText` for PDF, `File` for generic).
