import { createClient } from '@/lib/supabase/client';
import { useState, useCallback } from 'react';
import type { ImageUploadResult } from '@/modules/listings/types';
import { LISTING_BUCKET_NAME } from '@/constants/listings';
import { compressImage } from '@/lib/compress-image';

/**
 * Hook for uploading/deleting images to Supabase storage (client-side)
 * Used to avoid Vercel file size limits
 */
export const useImageUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<ImageUploadResult[]>([]);

  /**
   * Upload multiple images to Supabase storage
   * @param files Array of File objects with metadata
   * @returns Array of upload results with paths and URLs
   */
  const uploadImages = useCallback(
    async (
      files: Array<{ file: File; isThumbnail: boolean }>
    ): Promise<ImageUploadResult[]> => {
      setIsUploading(true);
      setUploadError(null);

      const supabase = createClient();
      const results: ImageUploadResult[] = [];

      try {
        for (const { file, isThumbnail } of files) {
          // Compress image before upload
          const compressedFile = await compressImage(file);

          // Generate unique filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const fileName = `listings/${timestamp}-${randomId}.webp`;

          // Upload compressed image to storage
          const { data, error } = await supabase.storage
            .from(LISTING_BUCKET_NAME)
            .upload(fileName, compressedFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) {
            throw new Error(`Failed to upload image: ${error.message}`);
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage
            .from(LISTING_BUCKET_NAME)
            .getPublicUrl(data.path);

          results.push({
            path: data.path,
            url: publicUrl,
            isThumbnail,
          });
        }

        setUploadedImages(results);
        return results;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Upload failed';
        setUploadError(message);

        // Cleanup any successfully uploaded images on error
        if (results.length > 0) {
          const paths = results.map((r) => r.path);
          await supabase.storage.from(LISTING_BUCKET_NAME).remove(paths);
        }

        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  /**
   * Delete images from storage (for cleanup on error)
   * @param paths Array of storage paths to delete
   */
  const deleteImages = useCallback(async (paths: string[]): Promise<void> => {
    if (paths.length === 0) return;

    const supabase = createClient();

    const { error } = await supabase.storage
      .from(LISTING_BUCKET_NAME)
      .remove(paths);

    if (error) {
      console.error('Failed to delete images:', error);
    }

    setUploadedImages([]);
  }, []);

  /**
   * Clear uploaded images state and delete from storage
   */
  const cleanup = useCallback(async (): Promise<void> => {
    if (uploadedImages.length > 0) {
      await deleteImages(uploadedImages.map((img) => img.path));
    }
  }, [uploadedImages, deleteImages]);

  return {
    isUploading,
    uploadError,
    uploadedImages,
    uploadImages,
    deleteImages,
    cleanup,
  };
};
