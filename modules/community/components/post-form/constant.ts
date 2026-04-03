import { PostFormInitialData } from './types';
import { FileUploadConfig } from '@/components/file-upload/types';
import {
  ACCEPTED_COMMUNITY_FILE_TYPES,
  MAX_COMMUNITY_ATTACHMENTS,
  MAX_COMMUNITY_UPLOAD_SIZE,
} from '@/constants/community-file';
import { PostCategory } from '../../types';

export const communityFileUploadConfig: FileUploadConfig = {
  bucketName: 'community-attachments',
  pathPrefix: 'community/',
  maxFiles: MAX_COMMUNITY_ATTACHMENTS,
  maxSizeBytes: MAX_COMMUNITY_UPLOAD_SIZE,
  acceptedTypes: ACCEPTED_COMMUNITY_FILE_TYPES,
  enableCompression: false,
  displayMode: 'file-list',
};

export const getDefaultValues = (initialData?: PostFormInitialData) => {
  if (initialData) {
    return {
      title: initialData.title,
      content: initialData.content,
      post_category: initialData.post_category,
      // Map FileUploadItem[] to ExistingAttachment shape expected by update schema
      attachments: initialData.attachments.map((att) => ({
        preview: att.preview,
        isThumbnail: att.isThumbnail,
        isExisting: true as const,
      })),
    };
  }

  return {
    title: '',
    content: '',
    post_category: 'questions' as PostCategory,
    attachments: [],
  };
};
