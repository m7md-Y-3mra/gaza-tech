import { useReducer, useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ImageFile, UseImageUploadProps } from '../types';
import { imageReducer } from '../reducers';
import { MAX_IMAGES_NUMBER } from '@/constants/image-file';

export const useImageUpload = (props: UseImageUploadProps) => {
    const { mode, name } = props;
    const initialImages: ImageFile[] =
        mode === 'update' ? props.initialImages : [];
    const { setValue, setError, clearErrors } = useFormContext();

    const [state, dispatch] = useReducer(imageReducer, { images: initialImages });
    const [isDragging, setIsDragging] = useState(false);

    const { images } = state;

    /** Sync the reducer state to react-hook-form */
    const syncFormValue = useCallback(
        (imgs: ImageFile[]) => {
            const images = imgs.map(({ id: _id, ...rest }) => rest);
            setValue(name, images, {
                shouldTouch: true,
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [name, setValue]
    );

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

            if (fileArray.length > 0) {
                clearErrors(name);
            }

            dispatch({ type: 'ADD_IMAGES', payload: { files: fileArray, remainingSlots } });

            syncFormValue([...images]);
        },
        [images, name, setError, clearErrors, syncFormValue]
    );

    const removeImage = useCallback(
        (id: string) => {
            dispatch({ type: 'REMOVE_IMAGE', payload: { id } });
            syncFormValue([...images]);
            clearErrors(name);
        },
        [images, name, clearErrors, syncFormValue]
    );

    const setThumbnail = useCallback(
        (id: string) => {
            dispatch({ type: 'SET_THUMBNAIL', payload: { id } });
            syncFormValue([...images]);
        },
        [images, syncFormValue]
    );

    const reorderImages = useCallback(
        (startIndex: number, endIndex: number) => {
            dispatch({ type: 'REORDER_IMAGES', payload: { startIndex, endIndex } });
            syncFormValue([...images]);
        },
        [images, syncFormValue]
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
