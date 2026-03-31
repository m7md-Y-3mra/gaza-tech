# Tasks: Reusable File Upload Component

**Input**: Design documents from `/specs/001-reusable-file-upload/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — manual testing only.

**Organization**: Tasks grouped by user story. Each story independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure for the shared file upload component.

- [ ] T001 Create the shared file-upload component directory structure by running: `mkdir -p components/file-upload/types components/file-upload/hooks components/file-upload/reducers`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared types, reducer, and hooks that ALL user stories depend on. These files are extracted and generalized from the existing listings image upload code.

**CRITICAL**: No user story work can begin until this phase is complete.

### T002 — Shared Types

- [ ] T002 [P] Create shared file upload types in `components/file-upload/types/index.ts`

**What to create**: A new file at `components/file-upload/types/index.ts` with these exact types.

**Reference**: Read `modules/listings/components/listing-form/components/image-upload/types/index.ts` and `modules/listings/components/listing-form/types/index.ts` for the original types. The shared types below are generic versions of those.

```typescript
// components/file-upload/types/index.ts

// ─── Display Mode ───────────────────────────────────────────────────
export type FileUploadDisplayMode = 'image-grid' | 'file-list';

// ─── Configuration ──────────────────────────────────────────────────
export type FileUploadConfig = {
  bucketName: string;
  pathPrefix: string;
  maxFiles: number;
  maxSizeBytes: number;
  minSizeBytes?: number;
  acceptedTypes: string[];
  enableCompression: boolean;
  displayMode: FileUploadDisplayMode;
};

// ─── File Upload Item ───────────────────────────────────────────────
export type FileUploadItemBase = {
  id: string;
  preview: string;
  isThumbnail: boolean;
};

export type NewFileUploadItem = FileUploadItemBase & {
  isExisting: false;
  file: File;
};

export type ExistingFileUploadItem = FileUploadItemBase & {
  isExisting: true;
};

export type FileUploadItem = NewFileUploadItem | ExistingFileUploadItem;

// ─── Upload Result ──────────────────────────────────────────────────
export type FileUploadResult = {
  path: string;
  url: string;
};

// ─── Component Props ────────────────────────────────────────────────
type FileUploadCreateProps = {
  mode: 'create';
};

type FileUploadUpdateProps = {
  mode: 'update';
  initialFiles: FileUploadItem[];
};

export type FileUploadProps = {
  name: string;
  config: FileUploadConfig;
  disabled?: boolean;
} & (FileUploadCreateProps | FileUploadUpdateProps);

// ─── Hook Props ─────────────────────────────────────────────────────
type UseFileUploadBase = {
  name: string;
  config: FileUploadConfig;
  disabled?: boolean;
};

export type UseFileUploadCreate = UseFileUploadBase & {
  mode: 'create';
};

export type UseFileUploadUpdate = UseFileUploadBase & {
  mode: 'update';
  initialFiles: FileUploadItem[];
};

export type UseFileUploadProps = UseFileUploadCreate | UseFileUploadUpdate;
```

**Key differences from listings types**:
- `isThumbnail` is on the base type (always present, defaults to `false` in file-list mode)
- `FileUploadConfig` replaces hardcoded constants
- `FileUploadResult` does NOT include `isThumbnail` (consumer adds it if needed)
- Props include `config: FileUploadConfig` instead of using global constants

### T003 — Shared Reducer

- [ ] T003 Create shared file reducer in `components/file-upload/reducers/fileReducer.ts`

**What to create**: Copy `modules/listings/components/listing-form/components/image-upload/reducers/imageReducer.ts` and rename all types/actions from `Image*` to `File*`.

**Reference**: Read `modules/listings/components/listing-form/components/image-upload/reducers/imageReducer.ts` (107 lines). The new file is nearly identical but uses the shared types.

**Exact changes from the original**:
1. Change import: `import type { FileUploadItem, FileUploadDisplayMode } from '../types';` (instead of `ImageFileUploadImage`)
2. Rename `ImageState` → `FileUploadState` with `files` instead of `images`
3. Rename actions: `ADD_IMAGES` → `ADD_FILES`, `REMOVE_IMAGE` → `REMOVE_FILE`, `REORDER_IMAGES` → `REORDER_FILES` (keep `SET_THUMBNAIL` the same)
4. Rename `ImageAction` → `FileUploadAction`
5. Rename `imageReducer` → `fileReducer`
6. In `ADD_FILES` case: use `files` instead of `images` in state. The `AddFilesAction` payload now includes `displayMode: FileUploadDisplayMode`. The `isThumbnail` logic is guarded: only set `true` for the first file when `displayMode === 'image-grid'` AND the list was empty. In `file-list` mode, `isThumbnail` is always `false`.
7. In `REMOVE_FILE` case: use `files` instead of `images`. Thumbnail promotion logic stays the same.
8. In `SET_THUMBNAIL` case: use `files` instead of `images`.
9. In `REORDER_FILES` case: use `files` instead of `images`.
10. Remove the commented-out code block (lines 53-62 in the original).

```typescript
// components/file-upload/reducers/fileReducer.ts

import type { FileUploadItem, FileUploadDisplayMode } from '../types';

// ─── State ───────────────────────────────────────────────────────────
export type FileUploadState = {
  files: FileUploadItem[];
};

// ─── Actions ─────────────────────────────────────────────────────────
type AddFilesAction = {
  type: 'ADD_FILES';
  payload: { files: File[]; remainingSlots: number; displayMode: FileUploadDisplayMode };
};

type RemoveFileAction = {
  type: 'REMOVE_FILE';
  payload: { id: string };
};

type SetThumbnailAction = {
  type: 'SET_THUMBNAIL';
  payload: { id: string };
};

type ReorderFilesAction = {
  type: 'REORDER_FILES';
  payload: { startIndex: number; endIndex: number };
};

export type FileUploadAction =
  | AddFilesAction
  | RemoveFileAction
  | SetThumbnailAction
  | ReorderFilesAction;

// ─── Reducer ─────────────────────────────────────────────────────────
export const fileReducer = (
  state: FileUploadState,
  action: FileUploadAction
): FileUploadState => {
  switch (action.type) {
    case 'ADD_FILES': {
      const { files, remainingSlots, displayMode } = action.payload;
      const newFiles: FileUploadItem[] = files
        .slice(0, remainingSlots)
        .map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          isThumbnail:
            displayMode === 'image-grid' &&
            state.files.length === 0 &&
            files.indexOf(file) === 0,
          isExisting: false as const,
        }));

      return { files: [...state.files, ...newFiles] };
    }

    case 'REMOVE_FILE': {
      const { id } = action.payload;
      const removedFile = state.files.find((f) => f.id === id);

      if (removedFile) {
        URL.revokeObjectURL(removedFile.preview);
      }

      const newFiles = state.files.filter((f) => f.id !== id);

      if (removedFile?.isThumbnail && newFiles.length > 0) {
        newFiles[0] = { ...newFiles[0], isThumbnail: true };
      }

      return { files: newFiles };
    }

    case 'SET_THUMBNAIL': {
      const { id } = action.payload;
      return {
        files: state.files.map((f) => ({
          ...f,
          isThumbnail: f.id === id,
        })),
      };
    }

    case 'REORDER_FILES': {
      const { startIndex, endIndex } = action.payload;
      const newFiles = Array.from(state.files);
      const [removed] = newFiles.splice(startIndex, 1);
      newFiles.splice(endIndex, 0, removed);
      return { files: newFiles };
    }

    default:
      return state;
  }
};
```

**Important**: In the `ADD_FILES` case, the `isThumbnail` logic is guarded by `displayMode === 'image-grid'`. In `file-list` mode, `isThumbnail` is always `false` — matching the spec and data model. The `files.indexOf(file) === 0` pattern can be replaced with `i === 0` from `.map((file, i) => ...)` — both work.

### T004 — Reducer Barrel Export

- [ ] T004 Create reducer barrel export in `components/file-upload/reducers/index.ts`

**What to create**: A simple re-export file. Reference: `modules/listings/components/listing-form/components/image-upload/reducers/index.ts`.

```typescript
// components/file-upload/reducers/index.ts
export { fileReducer } from './fileReducer';
export type { FileUploadState, FileUploadAction } from './fileReducer';
```

### T005 — Shared Uploader Hook

- [ ] T005 Create shared file uploader hook in `components/file-upload/hooks/useFileUploader.ts`

**What to create**: Copy `modules/listings/components/listing-form/components/image-upload/hooks/useImageUploader.ts` (125 lines) and make these changes:

**Exact changes from the original**:
1. Replace `import { LISTING_BUCKET_NAME } from '@/constants/listings'` → remove (bucket comes from params)
2. Replace `import type { ImageUploadResult } from '@/modules/listings/types'` → `import type { FileUploadResult } from '../types'`
3. Hook now accepts params: `({ bucketName, pathPrefix, enableCompression }: { bucketName: string; pathPrefix: string; enableCompression: boolean })`
4. Replace `uploadImages` → `uploadFiles`, `deleteImages` → `deleteFiles`, `uploadedImages` → `uploadedFiles`
5. `uploadFiles` param changes: `files: Array<{ file: File }>` (NO `isThumbnail` — that's a consumer concern)
6. Replace all `LISTING_BUCKET_NAME` → `bucketName`
7. Replace hardcoded `listings/` path prefix → use `pathPrefix` parameter
8. Add compression guard: only call `compressImage()` if `enableCompression && file.type.startsWith('image/')`
9. When compression is disabled, preserve original file extension instead of forcing `.webp`
10. Return type changes: `FileUploadResult` (has `path` and `url`, NO `isThumbnail`)

```typescript
// components/file-upload/hooks/useFileUploader.ts

import { createClient } from '@/lib/supabase/client';
import { useState, useCallback } from 'react';
import type { FileUploadResult } from '../types';
import { compressImage } from '@/lib/compress-image';

type UseFileUploaderProps = {
  bucketName: string;
  pathPrefix: string;
  enableCompression: boolean;
};

export const useFileUploader = ({
  bucketName,
  pathPrefix,
  enableCompression,
}: UseFileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);

  const uploadFiles = useCallback(
    async (
      files: Array<{ file: File }>
    ): Promise<FileUploadResult[]> => {
      setIsUploading(true);
      setUploadError(null);

      const supabase = createClient();
      const results: FileUploadResult[] = [];

      try {
        for (const { file } of files) {
          let fileToUpload: File = file;
          let extension: string;

          // Compress only if enabled AND file is an image
          if (enableCompression && file.type.startsWith('image/')) {
            fileToUpload = await compressImage(file);
            extension = 'webp';
          } else {
            // Preserve original extension
            const parts = file.name.split('.');
            extension = parts.length > 1 ? parts[parts.length - 1] : 'bin';
          }

          // Generate unique filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const fileName = `${pathPrefix}${timestamp}-${randomId}.${extension}`;

          // Upload to storage
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, fileToUpload, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from(bucketName).getPublicUrl(data.path);

          results.push({
            path: data.path,
            url: publicUrl,
          });
        }

        setUploadedFiles(results);
        return results;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Upload failed';
        setUploadError(message);

        // Cleanup any successfully uploaded files on error (atomic rollback)
        if (results.length > 0) {
          const paths = results.map((r) => r.path);
          await supabase.storage.from(bucketName).remove(paths);
        }

        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [bucketName, pathPrefix, enableCompression]
  );

  const deleteFiles = useCallback(
    async (paths: string[]): Promise<void> => {
      if (paths.length === 0) return;

      const supabase = createClient();

      const { error } = await supabase.storage.from(bucketName).remove(paths);

      if (error) {
        console.error('Failed to delete files:', error);
      }

      // Only remove the deleted paths from tracked state (not all)
      setUploadedFiles((prev) =>
        prev.filter((f) => !paths.includes(f.path))
      );
    },
    [bucketName]
  );

  const cleanup = useCallback(async (): Promise<void> => {
    if (uploadedFiles.length > 0) {
      await deleteFiles(uploadedFiles.map((f) => f.path));
    }
  }, [uploadedFiles, deleteFiles]);

  return {
    isUploading,
    uploadError,
    uploadedFiles,
    uploadFiles,
    deleteFiles,
    cleanup,
  };
};
```

### T006 — Shared File Upload State Hook

- [ ] T006 Create shared file upload state hook in `components/file-upload/hooks/useFileUpload.ts`

**What to create**: Copy `modules/listings/components/listing-form/components/image-upload/hooks/useImageUpload.ts` (89 lines) and generalize it.

**Exact changes from the original**:
1. Replace imports: use `UseFileUploadProps` from `../types`, `fileReducer` from `../reducers`, remove `imageFileSchema` and `MAX_IMAGES_NUMBER`
2. Hook accepts `UseFileUploadProps` which includes `config: FileUploadConfig`
3. Replace `MAX_IMAGES_NUMBER` → `config.maxFiles`
4. Replace `imageFileSchema.safeParse(file)` → inline validation using `config.maxSizeBytes`, `config.minSizeBytes`, and `config.acceptedTypes`
5. Rename all `image*` → `file*` (addImages→addFiles, removeImage→removeFile, etc.)
6. Rename state field: `state.images` → `state.files`
7. The `useEffect` form sync strips `id` before syncing (same as original)
8. The thumbnail logic: when `config.displayMode === 'file-list'`, set `isThumbnail: false` for all new files

```typescript
// components/file-upload/hooks/useFileUpload.ts

import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import type { UseFileUploadProps } from '../types';
import { fileReducer } from '../reducers';

export const useFileUpload = (
  props: UseFileUploadProps & { t: (key: string, values?: Record<string, string>) => string }
) => {
  const { mode, name, config, t } = props;
  const initialFiles = mode === 'update' ? props.initialFiles : [];
  const { setValue, setError, clearErrors } = useFormContext();

  const [state, dispatch] = useReducer(fileReducer, { files: initialFiles });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync the reducer state to react-hook-form
  useEffect(() => {
    const files = state.files.map(({ id: _id, ...rest }) => rest);
    setValue(name, files, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [state.files, setValue, name]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = config.maxFiles - state.files.length;

      if (remainingSlots <= 0) {
        setError(name, {
          type: 'manual',
          message: t('maxFilesReached', { max: String(config.maxFiles) }),
        });
        return;
      }

      // Validate each file before adding to state
      const validFiles: File[] = [];

      for (const file of fileArray) {
        // Check MIME type
        if (!config.acceptedTypes.includes(file.type)) {
          toast.error(t('invalidFileType', { name: file.name }));
          continue;
        }

        // Check max size
        if (file.size > config.maxSizeBytes) {
          const maxMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(0);
          toast.error(t('fileTooLarge', { name: file.name, maxSize: maxMB }));
          continue;
        }

        // Check min size (optional)
        if (config.minSizeBytes && file.size < config.minSizeBytes) {
          const minKB = (config.minSizeBytes / 1000).toFixed(0);
          toast.error(t('fileTooSmall', { name: file.name, minSize: minKB }));
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        clearErrors(name);
        dispatch({
          type: 'ADD_FILES',
          payload: { files: validFiles, remainingSlots, displayMode: config.displayMode },
        });
      }
    },
    [state.files, name, config, setError, clearErrors]
  );

  const removeFile = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_FILE', payload: { id } });
      clearErrors(name);
    },
    [name, clearErrors]
  );

  const setThumbnail = useCallback((id: string) => {
    dispatch({ type: 'SET_THUMBNAIL', payload: { id } });
  }, []);

  const reorderFiles = useCallback(
    (startIndex: number, endIndex: number) => {
      dispatch({
        type: 'REORDER_FILES',
        payload: { startIndex, endIndex },
      });
    },
    []
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!props.disabled) {
        setIsDragging(true);
      }
    },
    [props.disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!props.disabled && e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [props.disabled, addFiles]
  );

  return {
    files: state.files,
    isDragging,
    addFiles,
    removeFile,
    setThumbnail,
    reorderFiles,
    fileInputRef,
    openFilePicker,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};
```

**Important notes**:
- The `disabled` prop is accessed as `props.disabled` — `UseFileUploadBase` includes `disabled?: boolean` (defined in T002).
- The inline validation replaces the zod `imageFileSchema`. This is intentional — the shared component validates using the config object, not a hardcoded schema. The listing-specific zod schema (`schemas/image-file.ts`) is still used by the listing form's react-hook-form validation, not by the upload component.

### T007 — i18n Keys

- [ ] T007 [P] Add shared FileUpload i18n keys to `messages/en.json` and `messages/ar.json`

**What to do**: Add a new top-level key `"FileUpload"` to both translation files. Place it after any existing top-level key (before the closing `}`).

**Do NOT modify or remove the existing `"ListingForm.images"` keys** — those will still be used by the listings-specific wrapper.

**Add to `messages/en.json`**:
```json
"FileUpload": {
  "uploadTitle": "Upload Files",
  "dragDrop": "Drag and drop or click to browse",
  "chooseFiles": "Choose Files",
  "supportedFormats": "Supported formats: {formats} (Max {maxSize}MB each)",
  "fileCount": "{count}/{max} Files",
  "cover": "Cover",
  "setAsCover": "Set as Cover",
  "removeFile": "Remove file",
  "invalidFileType": "\"{name}\": Invalid file type",
  "fileTooLarge": "\"{name}\": File size must be less than {maxSize}MB",
  "fileTooSmall": "\"{name}\": File size must be at least {minSize}KB",
  "fileError": "File {index}: {message}",
  "maxFilesReached": "Maximum {max} files allowed"
}
```

**Add to `messages/ar.json`**:
```json
"FileUpload": {
  "uploadTitle": "رفع الملفات",
  "dragDrop": "اسحب وأفلت أو اضغط للتصفح",
  "chooseFiles": "اختر ملفات",
  "supportedFormats": "الصيغ المدعومة: {formats} (حد أقصى {maxSize} ميجابايت لكل ملف)",
  "fileCount": "{count}/{max} ملفات",
  "cover": "الغلاف",
  "setAsCover": "تعيين كغلاف",
  "removeFile": "إزالة الملف",
  "invalidFileType": "\"{name}\": نوع ملف غير صالح",
  "fileTooLarge": "\"{name}\": حجم الملف يجب أن يكون أقل من {maxSize} ميجابايت",
  "fileTooSmall": "\"{name}\": حجم الملف يجب أن يكون على الأقل {minSize} كيلوبايت",
  "fileError": "ملف {index}: {message}",
  "maxFilesReached": "الحد الأقصى {max} ملفات مسموح"
}
```

**Checkpoint**: Foundation ready — all shared types, reducer, hooks, and translations exist. User story implementation can now begin.

---

## Phase 3: User Story 1 — Listings Image Upload Continues Working (Priority: P1)

**Goal**: Create the shared `FileUpload` UI component with image-grid mode, then refactor the existing listings `ImageUpload` to use it. The listings upload must behave identically after the refactor.

**Independent Test**: Create and edit a listing with images. Verify drag-drop, file picker, thumbnail selection, remove, validation errors, reorder, and count badge all work identically.

### Implementation for User Story 1

- [ ] T008 [US1] Create shared FileUpload.tsx component (image-grid mode) in `components/file-upload/FileUpload.tsx`

**What to create**: A new client component that renders based on `config.displayMode`. For this task, implement ONLY the `image-grid` mode. The `file-list` mode will be added in Phase 4 (US2).

**Reference**: Copy the UI structure from `modules/listings/components/listing-form/components/image-upload/ImageUpload.tsx` (233 lines).

**Key differences from the original**:
1. Add `'use client';` at the top
2. Import types from `./types` (not listings types)
3. Import `useFileUpload` from `./hooks/useFileUpload` (not `useImageUpload`)
4. Use `useTranslations('FileUpload')` instead of `useTranslations('ListingForm.images')`
5. Replace all `MAX_IMAGES_NUMBER` → `config.maxFiles`
6. Replace all `MAX_UPLOAD_SIZE` → `config.maxSizeBytes`
7. Replace `ACCEPTED_FILE_TYPES` → `config.acceptedTypes`
8. Replace `images` → `files` in all variable names
9. Replace `addImages` → `addFiles`, `removeImage` → `removeFile`
10. Use the `fileInputRef` and `dragHandlers` from the hook (instead of inline handlers)
11. The `accept` attribute on the file input should use `config.acceptedTypes.join(',')`
12. Render `fileCount` translation key instead of `imageCount`
13. For file-list mode: render a placeholder `<div>File list mode — coming soon</div>` (will be implemented in T014)

```typescript
// components/file-upload/FileUpload.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import {
  AlertCircle,
  CloudUpload,
  FolderOpen,
  ImageOff,
  Plus,
  Trash,
} from 'lucide-react';
import { useFileUpload } from './hooks/useFileUpload';
import type { FileUploadProps, FileUploadItem } from './types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export const FileUpload: React.FC<FileUploadProps> = (props) => {
  const { mode, name, config, disabled = false } = props;
  const initialFiles = (
    mode === 'update' ? props.initialFiles : []
  ) as FileUploadItem[];

  const {
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const t = useTranslations('FileUpload');

  const {
    files,
    isDragging,
    addFiles,
    removeFile,
    setThumbnail,
    fileInputRef,
    openFilePicker,
    dragHandlers,
  } = useFileUpload(
    mode === 'create'
      ? { mode, name, config, disabled, t }
      : { mode, name, config, disabled, initialFiles, t }
  );

  const error = errors[name];
  const touched = touchedFields[name];
  const hasError = (isSubmitted || touched) && !!error;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  // ─── File-List Mode (implemented in T014) ───────────────────────
  if (config.displayMode === 'file-list') {
    return <div>File list mode — coming in T014</div>;
  }

  // ─── Image-Grid Mode ────────────────────────────────────────────
  return (
    <div>
      {/* Upload Area - Only show when not at max */}
      {files.length < config.maxFiles && (
        <div
          onClick={disabled ? undefined : openFilePicker}
          onDragOver={dragHandlers.onDragOver}
          onDragLeave={dragHandlers.onDragLeave}
          onDrop={dragHandlers.onDrop}
          className={`border-muted-foreground/30 relative mb-6 cursor-pointer rounded-xl border-3 border-dashed p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-green-50'
              : 'hover:border-primary hover:bg-green-50'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={config.acceptedTypes.join(',')}
            multiple
            disabled={disabled}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center">
            <div className="from-primary to-secondary mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg">
              <CloudUpload className="h-9 w-9 text-white" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-bold">
              {t('uploadTitle')}
            </h3>
            <p className="text-muted-foreground mb-4">{t('dragDrop')}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
              disabled={disabled}
              className="bg-muted text-foreground hover:bg-muted/80 flex rounded-xl px-6 py-3 font-semibold transition-all duration-200"
            >
              <FolderOpen className="me-2 h-5 w-5" /> {t('chooseFiles')}
            </button>
            <p className="text-muted-foreground mt-4 text-xs">
              {t('supportedFormats', {
                formats: config.acceptedTypes
                  .map((type) => type.split('/')[1])
                  .join(', '),
                maxSize: String(config.maxSizeBytes / (1024 * 1024)),
              })}
            </p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {files.length > 0 && (
        <div className="mb-6 grid grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group relative">
              <div
                className={`bg-muted relative aspect-square overflow-hidden rounded-xl ${
                  file.isThumbnail
                    ? 'border-primary border-2'
                    : 'border-2 border-transparent'
                }`}
              >
                <Image
                  src={file.preview}
                  alt={!file.isExisting && 'file' in file ? file.file.name : 'Uploaded file'}
                  className="h-full w-full object-cover"
                  fill
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // Show fallback placeholder sibling
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
                <div className="hidden h-full w-full items-center justify-center">
                  <ImageOff className="text-muted-foreground h-8 w-8" />
                </div>
              </div>

              {/* Cover Badge */}
              {file.isThumbnail && (
                <div className="bg-primary absolute start-2 top-2 rounded-md px-2 py-1 text-xs font-bold text-white">
                  {t('cover')}
                </div>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                disabled={disabled}
                aria-label={t('removeFile')}
                className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600"
              >
                <Trash className="h-5 w-5" />
              </button>

              {/* Set as Cover Button */}
              {!file.isThumbnail && (
                <div className="absolute start-2 end-2 bottom-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setThumbnail(file.id)}
                    disabled={disabled}
                    className="bg-card bg-opacity-90 text-foreground hover:bg-opacity-100 w-full rounded py-1 text-xs"
                  >
                    {t('setAsCover')}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: config.maxFiles - files.length }).map(
            (_, index) => (
              <div
                key={`empty-${index}`}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={t('chooseFiles')}
                onClick={disabled ? undefined : openFilePicker}
                onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) openFilePicker(); }}
                className={`border-muted-foreground/30 bg-muted/30 flex aspect-square items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary hover:bg-green-50'
                }`}
              >
                <Plus className="text-muted-foreground h-5 w-5" />
              </div>
            )
          )}
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="text-destructive mb-4 flex items-center gap-2 text-sm">
          <span>
            {Array.isArray(error) ? (
              error?.map((err, index) => (
                <div key={index} className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>
                    {t('fileError', {
                      index: index + 1,
                      message: err?.file?.message ?? err?.message ?? '',
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p>{error?.message as string}</p>
            )}
          </span>
        </div>
      )}

      {/* File Count Badge */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <div className="rounded-lg bg-green-50 px-4 py-2">
            <span className="text-primary text-sm font-semibold">
              {t('fileCount', {
                count: files.length,
                max: config.maxFiles,
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
```

**Note on `disabled` prop**: The `disabled?: boolean` property is already defined on `UseFileUploadBase` in T002's type definition.

- [ ] T009 [US1] Create barrel export in `components/file-upload/index.ts`

**What to create**: A barrel export file that exposes the public API.

```typescript
// components/file-upload/index.ts
export { FileUpload } from './FileUpload';
export { useFileUploader } from './hooks/useFileUploader';
export type {
  FileUploadItem,
  NewFileUploadItem,
  ExistingFileUploadItem,
  FileUploadConfig,
  FileUploadDisplayMode,
  FileUploadResult,
  FileUploadProps,
} from './types';
```

- [ ] T010 [US1] Refactor listings ImageUpload.tsx to be a thin wrapper around the shared FileUpload in `modules/listings/components/listing-form/components/image-upload/ImageUpload.tsx`

**What to do**: Replace the entire content of `ImageUpload.tsx` (currently 233 lines) with a thin wrapper that imports `FileUpload` from the shared component and passes listing-specific configuration.

**Important**: The wrapper must maintain the SAME props interface (`ImageUploadProps`) so that `ListingFormClient.tsx` needs ZERO changes.

```typescript
// modules/listings/components/listing-form/components/image-upload/ImageUpload.tsx
'use client';

import { FileUpload } from '@/components/file-upload';
import type { FileUploadConfig, FileUploadItem } from '@/components/file-upload';
import type { ImageUploadProps } from './types';
import {
  ACCEPTED_FILE_TYPES,
  MAX_IMAGES_NUMBER,
  MAX_UPLOAD_SIZE,
} from '@/constants/image-file';

const LISTING_UPLOAD_CONFIG: FileUploadConfig = {
  bucketName: 'marketplace-image',
  pathPrefix: 'listings/',
  maxFiles: MAX_IMAGES_NUMBER,
  maxSizeBytes: MAX_UPLOAD_SIZE,
  minSizeBytes: 10_000,
  acceptedTypes: ACCEPTED_FILE_TYPES,
  enableCompression: true,
  displayMode: 'image-grid',
};

const ImageUpload: React.FC<ImageUploadProps> = (props) => {
  const { mode, name, disabled } = props;

  if (mode === 'update') {
    // Convert listing-specific ImageFileUploadImage[] to FileUploadItem[]
    const initialFiles: FileUploadItem[] = props.initialImages.map((img) => ({
      id: img.id,
      preview: img.preview,
      isThumbnail: img.isThumbnail,
      ...(img.isExisting
        ? { isExisting: true as const }
        : { isExisting: false as const, file: (img as { file: File }).file }),
    }));

    return (
      <FileUpload
        name={name}
        mode="update"
        initialFiles={initialFiles}
        config={LISTING_UPLOAD_CONFIG}
        disabled={disabled}
      />
    );
  }

  return (
    <FileUpload
      name={name}
      mode="create"
      config={LISTING_UPLOAD_CONFIG}
      disabled={disabled}
    />
  );
};

export default ImageUpload;
```

**Performance note**: The consuming page (e.g., `ListingFormClient.tsx`) should import the wrapper via `next/dynamic` with `{ ssr: false }` to avoid loading the file upload component on initial page render:
```typescript
const ImageUpload = dynamic(
  () => import('../components/image-upload').then((mod) => mod.default),
  { ssr: false }
);
```
If the component is already below the fold or inside a lazy-rendered tab, this is optional. Verify via T018 Lighthouse audit.

- [ ] T011 [US1] Verify listings image-upload types compatibility (no changes needed) in `modules/listings/components/listing-form/components/image-upload/types/index.ts`

**What to do**: The types file currently defines listing-specific types. Keep the types that `ListingFormClient.tsx` and `useListingForm.ts` depend on, but base them on shared types where possible. The existing types must remain compatible so nothing else breaks.

**Keep the file as-is for now** — do NOT change it. The existing `ImageFileUploadImage`, `ImageUploadProps`, and `UseImageUploadProps` types are still imported by other files. Changing them would cause cascading breakage. The wrapper in T010 handles the type mapping internally.

**Note**: The stray text ` FileUploadItemBase` on line 30 of the original file is a bug in the existing code. You may remove it if you touch this file.

- [ ] T012 [US1] Update listings image-upload exports in `modules/listings/components/listing-form/components/image-upload/index.ts`

**What to do**: Keep exports the same — no changes needed. The `ImageUpload` default export still comes from `./ImageUpload` (which is now the thin wrapper). The type exports remain the same.

The current file is:
```typescript
export { default } from './ImageUpload';
export type {
  CreateImageFileUploadImage as ImageFile,
  ImageUploadProps,
} from './types';
```

**No changes needed for this file.** Mark as done.

- [ ] T013 [US1] Update useListingForm.ts to import useFileUploader from shared component in `modules/listings/components/listing-form/hooks/useListingForm.ts`

**What to do**: Change the import of `useImageUploader` to use the shared `useFileUploader` hook instead.

**Change line 22**:
```typescript
// BEFORE:
import { useImageUploader } from '../components/image-upload/hooks/useImageUploader';

// AFTER:
import { useFileUploader } from '@/components/file-upload';
```

**Change lines 44-45** (the hook call):
```typescript
// BEFORE:
const { uploadImages, deleteImages, isUploading, uploadError } =
  useImageUploader();

// AFTER:
const { uploadFiles, deleteFiles, isUploading, uploadError } =
  useFileUploader({
    bucketName: 'marketplace-image',
    pathPrefix: 'listings/',
    enableCompression: true,
  });
```

**Change all usages in the onSubmit function**:
1. Replace `uploadImages(images)` → `uploadFiles(images.map(img => ({ file: img.file })))` — but note that `uploadFiles` returns `FileUploadResult` without `isThumbnail`. You need to map the thumbnail info back:

```typescript
// In CREATE mode (around line 78):
// BEFORE:
const uploadResults = await uploadImages(images);

// AFTER:
const rawResults = await uploadFiles(
  images.map((img) => ({ file: img.file }))
);
// Map isThumbnail back from form data
const uploadResults = rawResults.map((result, i) => ({
  ...result,
  isThumbnail: images[i].isThumbnail,
}));
```

2. Replace `deleteImages(...)` → `deleteFiles(...)` everywhere (3 occurrences: lines 88, 133, 188).

3. In UPDATE mode (around line 146-148):
```typescript
// BEFORE:
uploadResults = await uploadImages(newImages);

// AFTER:
const rawUploadResults = await uploadFiles(
  newImages.map((img) => ({ file: img.file }))
);
uploadResults = rawUploadResults.map((result, i) => ({
  ...result,
  isThumbnail: newImages[i].isThumbnail,
}));
```

**This is the most complex task.** Take care to update ALL references to `uploadImages` → `uploadFiles` and `deleteImages` → `deleteFiles`.

**Checkpoint**: At this point, the listings image upload should work identically. Test by:
1. Going to the create listing form
2. Dragging and dropping images — they should appear in the grid
3. Setting a thumbnail — the cover badge should move
4. Removing an image — it should be removed
5. Submitting the form — images should upload to the `marketplace-image` bucket
6. Editing a listing — existing images should load and be editable

---

## Phase 4: User Story 2 — Community Post Author Attaches Files (Priority: P2)

**Goal**: Add the file-list display mode to the shared `FileUpload` component so community posts can use it with images + PDFs.

**Independent Test**: Render the shared `FileUpload` component with `displayMode: 'file-list'` and community-specific config. Verify drag-drop works with PDFs and images, inline image thumbnails show for images, file-type icons show for PDFs, remove works, and max file limit is enforced.

### Implementation for User Story 2

- [ ] T014 [US2] Implement file-list display mode in `components/file-upload/FileUpload.tsx`

**What to do**: Replace the placeholder `<div>File list mode — coming in T014</div>` (added in T008) with the actual file-list UI.

**Replace the file-list early return block** with:

```tsx
// ─── File-List Mode ───────────────────────────────────────────────
if (config.displayMode === 'file-list') {
  return (
    <div>
      {/* Upload Area - Only show when not at max */}
      {files.length < config.maxFiles && (
        <div
          onDragOver={dragHandlers.onDragOver}
          onDragLeave={dragHandlers.onDragLeave}
          onDrop={dragHandlers.onDrop}
          className={`border-muted-foreground/30 relative mb-4 cursor-pointer rounded-xl border-3 border-dashed p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-green-50'
              : 'hover:border-primary hover:bg-green-50'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={config.acceptedTypes.join(',')}
            multiple
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={t('uploadTitle')}
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center">
            <CloudUpload className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-foreground text-sm font-medium">
              {t('dragDrop')}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {t('supportedFormats', {
                formats: config.acceptedTypes
                  .map((type) => type.split('/')[1])
                  .join(', '),
                maxSize: String(config.maxSizeBytes / (1024 * 1024)),
              })}
            </p>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <ul className="mb-4 space-y-2">
          {files.map((file) => {
            const isImage = !file.isExisting && 'file' in file
              ? file.file.type.startsWith('image/')
              : file.preview.match(/\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i) !== null;

            return (
              <li
                key={file.id}
                className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
              >
                {/* Preview: image thumbnail or file icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {isImage ? (
                    <>
                      <Image
                        src={file.preview}
                        alt={!file.isExisting && 'file' in file ? file.file.name : 'Uploaded file'}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                      />
                      <div className="hidden h-full w-full items-center justify-center">
                        <ImageOff className="text-muted-foreground h-6 w-6" />
                      </div>
                    </>
                  ) : (
                    <FileTextIcon className="text-muted-foreground h-6 w-6" />
                  )}
                </div>

                {/* File info */}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">
                    {!file.isExisting && 'file' in file
                      ? file.file.name
                      : file.preview.split('/').pop() ?? 'File'}
                  </p>
                  {!file.isExisting && 'file' in file && (
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(file.file.size)}
                    </p>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  disabled={disabled}
                  aria-label={t('removeFile')}
                  className="text-muted-foreground hover:text-destructive shrink-0 p-1 transition-colors"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="text-destructive mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>{error?.message as string}</p>
        </div>
      )}

      {/* File Count */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <span className="text-muted-foreground text-xs">
            {t('fileCount', {
              count: files.length,
              max: config.maxFiles,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
```

**Also add this import at the top of the file** (alongside existing lucide imports — `ImageOff` is already imported from T008):
```typescript
import { FileText as FileTextIcon } from 'lucide-react';
```
Note: `ImageOff` is already imported in T008's lucide import line. If not, add it there.

**Also add this helper function** before the component (or at the bottom of the file, outside the component):
```typescript
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

**Checkpoint**: At this point, both display modes should work. The shared component supports:
- `image-grid` mode with thumbnails, reorder, image previews (used by listings)
- `file-list` mode with inline image previews, file-type icons, file info (used by community)

---

## Phase 5: User Story 3 — Developer Integrates Upload in a New Module (Priority: P3)

**Goal**: Verify the shared component has a clean, well-documented public API that any developer can integrate.

**Independent Test**: Import the shared component with a custom configuration and verify it works without modification.

### Implementation for User Story 3

- [ ] T015 [US3] Verify barrel exports are complete and types are properly exported from `components/file-upload/index.ts`

**What to do**: Read `components/file-upload/index.ts` (created in T009) and verify it exports:
1. `FileUpload` — the component
2. `useFileUploader` — the upload hook (for custom submit handlers)
3. All types: `FileUploadItem`, `NewFileUploadItem`, `ExistingFileUploadItem`, `FileUploadConfig`, `FileUploadDisplayMode`, `FileUploadResult`, `FileUploadProps`

**No code changes expected** — this is a verification task. If any exports are missing, add them.

**Checkpoint**: All user stories are now independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, code quality, and final verification.

- [ ] T016 [P] Add aria-label attributes to all interactive elements in `components/file-upload/FileUpload.tsx`

**What to do**: Ensure all buttons and interactive elements have `aria-label` attributes for screen readers. Verify:
1. The file input has `aria-label={t('uploadTitle')}` (already done in T008)
2. The delete button has `aria-label={t('removeFile')}` (already done in T008)
3. The "Choose Files" button is wrapped in a proper `<label>` or has `aria-label`
4. Empty slot divs have `role="button"` and `aria-label` attributes
5. The drag zone has `role="region"` with an appropriate label

Add any missing attributes. Example for empty slots:
```tsx
<div
  key={`empty-${index}`}
  role="button"
  tabIndex={0}
  aria-label={t('chooseFiles')}
  onClick={openFilePicker}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFilePicker(); }}
  className="..."
>
```

- [ ] T017 [P] Run code quality checks: `npm run check` (runs format + lint + type-check)

**What to do**: Run `npm run check` from the project root. Fix any errors:
1. If formatting errors: run `npm run format`
2. If lint errors: run `npm run lint -- --fix`
3. If type errors: fix the TypeScript errors in the relevant files

Common type errors to watch for:
- The `disabled` prop on `UseFileUploadProps` — make sure it was added to the type in T002
- The `FileUploadItem` type mapping in T010 — ensure the spread operator works with the discriminated union
- The `useFileUploader` return type in T013 — ensure `uploadFiles`/`deleteFiles` names match

- [ ] T018 Manually verify listings upload still works identically after all changes

**What to do**: Start the dev server (`npm run dev`) and test:
1. Navigate to the create listing page
2. Drag and drop 2-3 images into the upload area → they should appear in the grid
3. Click the thumbnail button on the second image → it should become the cover
4. Remove the first image → the grid should update, thumbnail should still be on the correct image
5. Try uploading a file that's too large or wrong type → error toast should appear
6. Fill out the full form and submit → images should upload to `marketplace-image` bucket and listing should be created successfully
7. Navigate to edit that listing → existing images should appear in the grid
8. Remove one existing image and add a new one → submit should work

9. Verify SC-003: uploading files takes at most 2 interactions (drop or click + select)
10. Verify SC-004: invalid files (wrong type, too large) are rejected with an error message within 1 second of selection
11. Switch locale to Arabic (`/ar`) and verify RTL layout: cover badge positioned at `start`, remove button at `end`, drag zone text aligned correctly, file count badge readable

12. Run a Lighthouse audit (Chrome DevTools, Incognito) on the create-listing page. Verify LCP < 2.5s, CLS < 0.1, and overall performance score >= 95%.

13. **Disabled state (both modes)**: While the form is submitting (or simulate `disabled={true}`), verify that the drop zone, file picker, remove buttons, and set-as-cover buttons are all non-interactive. Repeat for file-list mode.
14. **Corrupted image fallback**: Upload a valid-extension file with corrupted image data (e.g., rename a `.txt` to `.png`). Verify that the image grid shows the `ImageOff` fallback icon instead of a broken image. Repeat in file-list mode — the inline thumbnail should also show the fallback.
15. **Mixed valid/invalid files**: Drag a batch containing both valid images and an oversized file. Verify only valid files are added, and a toast appears for each rejected file naming the file and reason.

**No code changes** — this is a manual verification task. If any step fails, debug and fix the relevant task.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (directories must exist)
- **US1 (Phase 3)**: Depends on Phase 2 (shared types, reducer, hooks must exist)
- **US2 (Phase 4)**: Depends on T008 (shared FileUpload component must exist)
- **US3 (Phase 5)**: Depends on Phase 3 + Phase 4 (all modes implemented)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **User Story 2 (P2)**: Can start after T008 (the shared component exists) — Independent from US1 refactor
- **User Story 3 (P3)**: Verification only — depends on both US1 and US2 being complete

### Within Each Phase

```
Phase 2 (Foundational):
  T002 (types) ─┬─> T003 (reducer)  ─┐
                 ├─> T005 (uploader)  ├─> Phase 3 ready
                 ├─> T006 (state)     ┘
                 └─> T007 (i18n) ──────> T008 needs i18n keys

Phase 3 (US1):
  T008 (component) → T009 (barrel) → T010 (wrapper) → T011 (types) → T012 (exports) → T013 (form hook)

Phase 4 (US2):
  T014 (file-list mode) — single task, depends on T008

Phase 6 (Polish):
  T016 (a11y) ─┐
  T017 (lint)  ├─> T018 (manual test)
               ┘
```

### Parallel Opportunities

**Within Phase 2** (all create separate files):
```
T002 (types)  ─── can start immediately
T003 (reducer) ── depends on T002 (imports types)
T004 (barrel)  ── depends on T003
T005 (uploader) ─ depends on T002 (imports types)
T006 (state)  ─── depends on T002 + T003 (imports types + reducer)
T007 (i18n)   ─── can start immediately, parallel with T002
```

**Within Phase 6** (different files):
```
T016 (a11y) and T017 (lint) can run in parallel
```

---

## Parallel Example: Phase 2 Foundation

```bash
# These two can start in parallel (no dependencies):
Task T002: "Create shared types in components/file-upload/types/index.ts"
Task T007: "Add FileUpload i18n keys to messages/en.json and messages/ar.json"

# After T002 completes, these can run in parallel:
Task T003: "Create file reducer in components/file-upload/reducers/fileReducer.ts"
Task T005: "Create uploader hook in components/file-upload/hooks/useFileUploader.ts"

# After T003 completes:
Task T004: "Create reducer barrel in components/file-upload/reducers/index.ts"
Task T006: "Create state hook in components/file-upload/hooks/useFileUpload.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T007)
3. Complete Phase 3: User Story 1 (T008-T013)
4. **STOP and VALIDATE**: Test listings upload manually (T018)
5. If listings works identically → MVP is complete

### Incremental Delivery

1. Setup + Foundational → shared types, reducer, hooks ready
2. User Story 1 → image-grid mode + listings refactor → Test → MVP!
3. User Story 2 → file-list mode added → Test with community config
4. User Story 3 → Verify clean API → Ready for any consumer
5. Polish → Accessibility + lint + final manual test

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently testable after completion
- Commit after each task or logical group (per CLAUDE.md staged development rules)
- The existing `modules/listings/.../image-upload/hooks/useImageUpload.ts` and `reducers/imageReducer.ts` files are NOT deleted — they remain as legacy but are no longer called (the wrapper in T010 uses the shared component which has its own hooks/reducer). They can be deleted in a future cleanup task.
- The `schemas/image-file.ts` file is NOT modified — it's still used by the listings form's zod validation schema, which is separate from the upload component's config-based validation.
