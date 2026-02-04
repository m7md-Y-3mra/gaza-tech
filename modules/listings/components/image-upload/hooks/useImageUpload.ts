import { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ImageFile } from '../types';

export const useImageUpload = (
    name: string,
    maxImages: number = 5,
    maxSizeMB: number = 5
) => {
    const { setValue, setError, clearErrors } = useFormContext();
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const validateFile = useCallback(
        (file: File): string | null => {
            // Check file size
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            if (file.size > maxSizeBytes) {
                return `File size must be less than ${maxSizeMB}MB`;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                return 'Only image files are allowed';
            }

            return null;
        },
        [maxSizeMB]
    );

    const addImages = useCallback(
        (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const remainingSlots = maxImages - images.length;

            if (remainingSlots <= 0) {
                setError(name, {
                    type: 'manual',
                    message: `Maximum ${maxImages} images allowed`,
                });
                return;
            }

            const validFiles: ImageFile[] = [];
            const errors: string[] = [];

            fileArray.slice(0, remainingSlots).forEach((file) => {
                const error = validateFile(file);
                if (error) {
                    errors.push(error);
                } else {
                    const imageFile: ImageFile = {
                        id: `${Date.now()}-${Math.random()}`,
                        file,
                        preview: URL.createObjectURL(file),
                        isThumbnail: images.length === 0 && validFiles.length === 0,
                    };
                    validFiles.push(imageFile);
                }
            });

            if (errors.length > 0) {
                setError(name, {
                    type: 'manual',
                    message: errors[0],
                });
            } else {
                clearErrors(name);
            }

            if (validFiles.length > 0) {
                const newImages = [...images, ...validFiles];
                setImages(newImages);
                setValue(name, newImages);
            }
        },
        [images, maxImages, name, setValue, setError, clearErrors, validateFile]
    );

    const removeImage = useCallback(
        (id: string) => {
            const newImages = images.filter((img) => img.id !== id);

            // If removed image was thumbnail, make first image the thumbnail
            if (newImages.length > 0) {
                const removedWasThumbnail = images.find((img) => img.id === id)?.isThumbnail;
                if (removedWasThumbnail) {
                    newImages[0].isThumbnail = true;
                }
            }

            setImages(newImages);
            setValue(name, newImages);
            clearErrors(name);

            // Revoke object URL to prevent memory leaks
            const removedImage = images.find((img) => img.id === id);
            if (removedImage) {
                URL.revokeObjectURL(removedImage.preview);
            }
        },
        [images, name, setValue, clearErrors]
    );

    const setThumbnail = useCallback(
        (id: string) => {
            const newImages = images.map((img) => ({
                ...img,
                isThumbnail: img.id === id,
            }));
            setImages(newImages);
            setValue(name, newImages);
        },
        [images, name, setValue]
    );

    const reorderImages = useCallback(
        (startIndex: number, endIndex: number) => {
            const newImages = Array.from(images);
            const [removed] = newImages.splice(startIndex, 1);
            newImages.splice(endIndex, 0, removed);
            setImages(newImages);
            setValue(name, newImages);
        },
        [images, name, setValue]
    );

    return {
        images,
        isDragging,
        setIsDragging,
        addImages,
        removeImage,
        setThumbnail,
        reorderImages,
    };
};
