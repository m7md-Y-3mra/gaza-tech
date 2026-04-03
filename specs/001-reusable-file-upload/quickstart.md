# Quickstart: Reusable File Upload Component

**Date**: 2026-03-29 | **Branch**: `001-reusable-file-upload`

## Usage — Image Grid Mode (Listings)

```tsx
import { FileUpload } from '@/components/file-upload';

// Inside a FormProvider
<FileUpload
  name="images"
  mode="create"
  config={{
    bucketName: 'marketplace-image',
    pathPrefix: 'listings/',
    maxFiles: 5,
    maxSizeBytes: 2 * 1024 * 1024,
    minSizeBytes: 10_000,
    acceptedTypes: [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/avif',
    ],
    enableCompression: true,
    displayMode: 'image-grid',
  }}
  disabled={isSubmitting}
/>;
```

## Usage — File List Mode (Community Posts)

```tsx
import { FileUpload } from '@/components/file-upload';

<FileUpload
  name="attachments"
  mode="create"
  config={{
    bucketName: 'community-attachments',
    pathPrefix: 'posts/',
    maxFiles: 5,
    maxSizeBytes: 5 * 1024 * 1024,
    acceptedTypes: [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'application/pdf',
    ],
    enableCompression: false,
    displayMode: 'file-list',
  }}
  disabled={isSubmitting}
/>;
```

## Usage — Update Mode (Pre-populated)

```tsx
import { FileUpload } from '@/components/file-upload';
import type { FileUploadItem } from '@/components/file-upload';

const initialFiles: FileUploadItem[] = existingUrls.map((url, i) => ({
  id: `existing-${i}`,
  preview: url,
  isExisting: true as const,
}));

<FileUpload
  name="attachments"
  mode="update"
  initialFiles={initialFiles}
  config={communityConfig}
  disabled={isSubmitting}
/>;
```

## Using the Uploader Hook (in form submit)

```tsx
import { useFileUploader } from '@/components/file-upload';

const { uploadFiles, deleteFiles, cleanup, isUploading } = useFileUploader({
  bucketName: 'community-attachments',
  pathPrefix: 'posts/',
  enableCompression: false,
});

const onSubmit = async (data) => {
  try {
    const newFiles = data.attachments.filter((f) => !f.isExisting);
    const results = await uploadFiles(newFiles.map((f) => ({ file: f.file })));
    // results: Array<{ path: string; url: string }>
    await createPostAction({ ...data, attachments: results });
  } catch (error) {
    // uploadFiles already cleaned up uploaded files on failure
    toast.error('Upload failed');
  }
};
```

## File Structure

```
components/file-upload/
├── FileUpload.tsx              # Main UI component ('use client')
├── index.ts                    # Barrel exports (public API)
├── types/
│   └── index.ts                # FileUploadItem, FileUploadConfig, FileUploadResult, etc.
├── hooks/
│   ├── useFileUpload.ts        # State management (internal)
│   └── useFileUploader.ts      # Supabase upload/delete (public)
└── reducers/
    ├── fileReducer.ts          # ADD_FILES, REMOVE_FILE, SET_THUMBNAIL, REORDER_FILES
    └── index.ts
```
