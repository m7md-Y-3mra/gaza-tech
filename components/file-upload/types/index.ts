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
