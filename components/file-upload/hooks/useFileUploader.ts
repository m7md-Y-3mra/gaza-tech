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
    async (files: Array<{ file: File }>): Promise<FileUploadResult[]> => {
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
      setUploadedFiles((prev) => prev.filter((f) => !paths.includes(f.path)));
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
