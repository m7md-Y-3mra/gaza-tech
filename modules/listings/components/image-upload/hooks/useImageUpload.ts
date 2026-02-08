import { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ImageFile } from '../types';
import { MAX_IMAGES_NUMBER } from '@/constants/image-file';

export const useImageUpload = (name: string) => {
    const { setValue, setError, clearErrors } = useFormContext();
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const addImages = useCallback(
        (files: FileList | File[]) => {
            const fileArray = Array.from(files);
            const remainingSlots = MAX_IMAGES_NUMBER - images.length;

            if (remainingSlots <= 0) {
                setError(name, {
                    type: 'manual',
                    message: `Maximum ${MAX_IMAGES_NUMBER} images allowed`,
                });
                return;
            }

            const validFiles: ImageFile[] = [];
            const errors: string[] = [];

            fileArray.slice(0, remainingSlots).forEach((file) => {
                const imageFile: ImageFile = {
                    id: `${Date.now()}-${Math.random()}`,
                    file,
                    preview: URL.createObjectURL(file),
                    isThumbnail: images.length === 0 && validFiles.length === 0,
                };
                validFiles.push(imageFile);
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
                const formImages = newImages.map((img) => ({
                    file: img.file,
                    isThumbnail: img.isThumbnail,
                }));
                setValue(name, formImages, {
                    shouldTouch: true,
                    shouldDirty: true,
                    shouldValidate: true
                });
            }
        },
        [images, name, setValue, setError, clearErrors]
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
            const formImages = newImages.map((img) => ({
                file: img.file,
                isThumbnail: img.isThumbnail,
            }));
            setValue(name, formImages);
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
            const formImages = newImages.map((img) => ({
                file: img.file,
                isThumbnail: img.isThumbnail,
            }));
            setValue(name, formImages);
        },
        [images, name, setValue]
    );

    const reorderImages = useCallback(
        (startIndex: number, endIndex: number) => {
            const newImages = Array.from(images);
            const [removed] = newImages.splice(startIndex, 1);
            newImages.splice(endIndex, 0, removed);
            setImages(newImages);
            const formImages = newImages.map((img) => ({
                file: img.file,
                isThumbnail: img.isThumbnail,
            }));
            setValue(name, formImages);
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
