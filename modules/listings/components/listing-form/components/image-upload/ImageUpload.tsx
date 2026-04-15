'use client';

import { FileUpload } from '@/components/file-upload';
import type {
  FileUploadConfig,
  FileUploadItem,
} from '@/components/file-upload';
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
