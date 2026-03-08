/**
 * Extract storage path from Supabase public URL
 * URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
 */
export const extractPathFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};
