import { createClient } from '@/lib/supabase/client';
import { useState, useCallback } from 'react';
import { compressImage } from '@/lib/compress-image';

export const useImageUploader = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(
    async (
      files: File[],
      bucketName: string,
      folderPath: string = 'uploads'
    ): Promise<{ path: string; url: string; originalName: string }[]> => {
      setIsUploading(true);
      const supabase = createClient();
      const results: { path: string; url: string; originalName: string }[] = [];

      try {
        for (const file of files) {
          // Compress image before upload
          const compressedFile = await compressImage(file);

          // Generate unique filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const fileName = `${folderPath}/${timestamp}-${randomId}.webp`;

          // Upload to storage
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, compressedFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) throw new Error(`Failed to upload image: ${error.message}`);

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);

          results.push({ path: data.path, url: publicUrl, originalName: file.name });
        }

        return results;
      } catch (error) {
        // Cleanup successfully uploaded images if the batch fails
        if (results.length > 0) {
          await supabase.storage.from(bucketName).remove(results.map((r) => r.path));
        }
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const deleteFiles = useCallback(async (bucketName: string, paths: string[]) => {
    if (paths.length === 0) return;
    const supabase = createClient();
    await supabase.storage.from(bucketName).remove(paths);
  }, []);

  return { isUploading, uploadFiles, deleteFiles };
};