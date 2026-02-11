import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    useWebWorker: true,
} as const;

/**
 * Compress an image file using browser-image-compression.
 * Outputs a WebP file with a max size of 1 MB and max dimension of 1920px.
 */
export const compressImage = async (file: File): Promise<File> => {
    const compressedBlob = await imageCompression(file, COMPRESSION_OPTIONS);

    // imageCompression returns a File, but ensure the name has the correct extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    return new File([compressedBlob], `${nameWithoutExt}.webp`, {
        type: 'image/webp',
    });
};
