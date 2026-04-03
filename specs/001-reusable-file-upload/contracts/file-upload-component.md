# Contract: FileUpload Component API

**Date**: 2026-03-29 | **Branch**: `001-reusable-file-upload`

## Component: `<FileUpload />`

**Location**: `components/file-upload/FileUpload.tsx`

### Props

```typescript
type FileUploadProps = {
  name: string; // react-hook-form field name
  config: FileUploadConfig; // Controls all behavior
  disabled?: boolean; // Disable all interactions (e.g., during form submit)
} & ({ mode: 'create' } | { mode: 'update'; initialFiles: FileUploadItem[] });
```

### Behavior by Display Mode

#### `image-grid` mode

- Renders a drop zone + image grid (like current listings)
- Shows image previews in grid cells
- Supports thumbnail designation (first image auto-marked)
- Reorder action infrastructure present (`REORDER_FILES` reducer action, `reorderFiles` hook method); drag-to-reorder UI deferred to follow-up
- Shows empty-slot placeholders up to `maxFiles`
- Shows "X / maxFiles" count badge

#### `file-list` mode

- Renders a drop zone + vertical file list
- Image files: inline thumbnail preview
- Non-image files: file-type icon (from lucide-react)
- Shows file name + file size + remove button per item
- No thumbnail designation or reorder
- Drop zone hidden when `maxFiles` reached

### Integration

Must be rendered inside a `FormProvider` from react-hook-form. Syncs file state to the form field specified by `name` via `setValue()`.

---

## Hook: `useFileUpload`

**Location**: `components/file-upload/hooks/useFileUpload.ts`

### Input

```typescript
type UseFileUploadProps = {
  name: string;
  config: FileUploadConfig;
  disabled?: boolean;
} & ({ mode: 'create' } | { mode: 'update'; initialFiles: FileUploadItem[] });
```

### Return

```typescript
type UseFileUploadReturn = {
  files: FileUploadItem[];
  isDragging: boolean;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  setThumbnail: (id: string) => void;
  reorderFiles: (startIndex: number, endIndex: number) => void;
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
};
```

### Behavior

- `addFiles`: Validates each file against config (size + MIME type), creates `FileUploadItem` entries, dispatches to reducer, syncs to form via `setValue`.
- `removeFile`: Revokes ObjectURL, removes from state, clears field errors.
- `setThumbnail`: Only meaningful in `image-grid` mode. Updates `isThumbnail` flags.
- `reorderFiles`: Only meaningful in `image-grid` mode. Splice reorder.
- Form sync: `useEffect` on `state.files` triggers `setValue(name, files, { shouldValidate: true })`.

---

## Hook: `useFileUploader`

**Location**: `components/file-upload/hooks/useFileUploader.ts`

### Input

```typescript
type UseFileUploaderProps = {
  bucketName: string;
  pathPrefix: string;
  enableCompression: boolean;
};
```

### Return

```typescript
type UseFileUploaderReturn = {
  isUploading: boolean;
  uploadError: string | null;
  uploadedFiles: FileUploadResult[];
  uploadFiles: (files: Array<{ file: File }>) => Promise<FileUploadResult[]>;
  deleteFiles: (paths: string[]) => Promise<void>;
  cleanup: () => Promise<void>;
};
```

### Behavior

- `uploadFiles`: For each file:
  1. If `enableCompression` AND `file.type.startsWith('image/')` → compress via `compressImage()`
  2. Generate unique path: `${pathPrefix}${Date.now()}-${randomId}.${extension}`
  3. Upload to Supabase Storage bucket
  4. Get public URL via `getPublicUrl()`
  5. Return `{ path, url }`
  6. On any error: clean up all successfully uploaded files in this batch (atomic rollback)
- `deleteFiles`: Delete files by storage path. Silent on error (logs only).
- `cleanup`: Delete all tracked uploaded files from current session.

### Error Contract

- Upload failure → all previously uploaded files in batch are deleted → error is thrown
- Delete failure → logged to console, not thrown (best-effort cleanup)

---

## Reducer: `fileReducer`

**Location**: `components/file-upload/reducers/fileReducer.ts`

### Actions

| Action Type     | Payload                                                                         | Preconditions        |
| --------------- | ------------------------------------------------------------------------------- | -------------------- |
| `ADD_FILES`     | `{ files: File[]; remainingSlots: number; displayMode: FileUploadDisplayMode }` | `files.length > 0`   |
| `REMOVE_FILE`   | `{ id: string }`                                                                | `id` exists in state |
| `SET_THUMBNAIL` | `{ id: string }`                                                                | `id` exists in state |
| `REORDER_FILES` | `{ startIndex: number; endIndex: number }`                                      | Valid indices        |

### State Shape

```typescript
{ files: FileUploadItem[] }
```

---

## Barrel Export

**Location**: `components/file-upload/index.ts`

```typescript
export { FileUpload } from './FileUpload';
export type {
  FileUploadItem,
  NewFileUploadItem,
  ExistingFileUploadItem,
  FileUploadConfig,
  FileUploadDisplayMode,
  FileUploadResult,
  FileUploadProps,
} from './types';
export { useFileUploader } from './hooks/useFileUploader';
```

**Note**: `useFileUpload` and `fileReducer` are internal — not exported. Only the component, types, and uploader hook are public API.
