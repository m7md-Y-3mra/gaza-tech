# Data Model: Reusable File Upload Component

**Date**: 2026-03-29 | **Branch**: `001-reusable-file-upload`

## Entities

### FileUploadItem

Represents a single file in the upload queue. Generic version of `ImageFileUploadImage`.

```typescript
type FileUploadItemBase = {
  id: string; // Unique: `${Date.now()}-${Math.random()}`
  preview: string; // ObjectURL (new files) or public URL (existing files)
  isThumbnail: boolean; // true for the cover/primary image (image-grid mode); always false in file-list mode
};

type NewFileUploadItem = FileUploadItemBase & {
  isExisting: false;
  file: File;
};

type ExistingFileUploadItem = FileUploadItemBase & {
  isExisting: true;
};

type FileUploadItem = NewFileUploadItem | ExistingFileUploadItem;
```

**Notes**:

- `isThumbnail` is on the base type (always present, defaults to `false` in file-list mode)
- In `image-grid` mode, the reducer manages thumbnail designation (first file auto-marked, toggleable by user)
- In `file-list` mode, `isThumbnail` is always `false` — present on the type but never set to `true`
- This avoids needing a separate `ImageGridFileUploadItem` extension type or generics in the reducer/hooks

**Validation rules**:

- `id`: auto-generated, unique per add operation
- `preview`: for new files, created via `URL.createObjectURL(file)` — must be revoked on removal
- `file`: validated against config (size, MIME type) before adding to state
- `isExisting`: discriminator for update mode — existing files have no `file` property

### FileUploadConfig

Configuration object that controls the behavior of a specific upload instance.

```typescript
type FileUploadDisplayMode = 'image-grid' | 'file-list';

type FileUploadConfig = {
  bucketName: string; // Supabase Storage bucket name
  pathPrefix: string; // Path prefix in bucket (e.g., 'listings/', 'community/')
  maxFiles: number; // Maximum number of files allowed
  maxSizeBytes: number; // Maximum size per file in bytes
  minSizeBytes?: number; // Minimum size per file in bytes (optional)
  acceptedTypes: string[]; // Accepted MIME types
  enableCompression: boolean; // Whether to compress images before upload
  displayMode: FileUploadDisplayMode;
};
```

**Validation rules**:

- `bucketName`: non-empty string, must correspond to existing Supabase Storage bucket
- `pathPrefix`: should end with `/` (e.g., `'listings/'`, `'community/'`)
- `maxFiles`: positive integer, >= 1
- `maxSizeBytes`: positive integer
- `acceptedTypes`: non-empty array of valid MIME type strings

**Predefined configs** (consumer-provided, not part of shared component):

| Config              | Listings                                                           | Community                                                               |
| ------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `bucketName`        | `'marketplace-image'`                                              | `'community-attachments'`                                               |
| `pathPrefix`        | `'listings/'`                                                      | `'posts/'`                                                              |
| `maxFiles`          | `5`                                                                | `5`                                                                     |
| `maxSizeBytes`      | `2 * 1024 * 1024` (2MB)                                            | `5 * 1024 * 1024` (5MB)                                                 |
| `minSizeBytes`      | `10_000` (10KB)                                                    | `undefined`                                                             |
| `acceptedTypes`     | `['image/png','image/jpeg','image/jpg','image/webp','image/avif']` | `['image/png','image/jpeg','image/jpg','image/webp','application/pdf']` |
| `enableCompression` | `true`                                                             | `false`                                                                 |
| `displayMode`       | `'image-grid'`                                                     | `'file-list'`                                                           |

### FileUploadResult

Represents a successfully uploaded file returned by `useFileUploader`.

```typescript
type FileUploadResult = {
  path: string; // Storage path (e.g., 'listings/1709340000-abc.webp')
  url: string; // Public URL from getPublicUrl()
};
```

**Notes**:

- `isThumbnail` is NOT on this type — thumbnail designation is a consumer concern
- Listings will extend: `FileUploadResult & { isThumbnail: boolean }`
- This keeps the shared upload hook agnostic to thumbnail semantics

### FileUploadState (reducer)

```typescript
type FileUploadState = {
  files: FileUploadItem[];
};
```

**State transitions** (reducer actions):

| Action          | Payload                                                                         | Effect                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ADD_FILES`     | `{ files: File[]; remainingSlots: number; displayMode: FileUploadDisplayMode }` | Validates slot count, creates items, appends to state. `isThumbnail` auto-set only when `displayMode === 'image-grid'` |
| `REMOVE_FILE`   | `{ id: string }`                                                                | Revokes ObjectURL, removes from array                                                                                  |
| `SET_THUMBNAIL` | `{ id: string }`                                                                | Sets one item's thumbnail flag, clears others (image-grid only)                                                        |
| `REORDER_FILES` | `{ startIndex: number; endIndex: number }`                                      | Splice reorder (image-grid only)                                                                                       |

## Relationships

```
FileUploadConfig ──controls──> FileUpload (component)
FileUpload ──manages──> FileUploadItem[] (via reducer)
FileUploadItem[] ──uploaded by──> useFileUploader ──produces──> FileUploadResult[]
FileUploadResult[] ──consumed by──> form submit handler (consumer)
```

## Mapping to Existing Types

| Shared Type        | Existing Listings Type  | Location                                           |
| ------------------ | ----------------------- | -------------------------------------------------- |
| `FileUploadItem`   | `ImageFileUploadImage`  | `image-upload/types/index.ts`                      |
| `FileUploadConfig` | _(hardcoded constants)_ | `constants/image-file.ts`, `constants/listings.ts` |
| `FileUploadResult` | `ImageUploadResult`     | `listing-form/types/index.ts`                      |
| `FileUploadState`  | `ImageState`            | `image-upload/reducers/imageReducer.ts`            |
