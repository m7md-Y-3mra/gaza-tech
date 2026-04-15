import { useReducer, useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import type { UseImageUploadProps } from '../types';
import { imageReducer } from '../reducers';
import { imageFileSchema } from '@/schemas/image-file';
import { MAX_IMAGES_NUMBER } from '@/constants/image-file';

export const useImageUpload = (props: UseImageUploadProps) => {
  const { mode, name } = props;
  const initialImages = mode === 'update' ? props.initialImages : [];
  const { setValue, setError, clearErrors } = useFormContext();

  const [state, dispatch] = useReducer(imageReducer, { images: initialImages });
  const [isDragging, setIsDragging] = useState(false);

  /** Sync the reducer state to react-hook-form */
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const images = state.images.map(({ id: _imageId, ...rest }) => rest);
    setValue(name, images, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [state.images, setValue, name]);

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = MAX_IMAGES_NUMBER - state.images.length;

      if (remainingSlots <= 0) {
        setError(name, {
          type: 'manual',
          message: `Maximum ${MAX_IMAGES_NUMBER} images allowed`,
        });
        return;
      }

      // Validate each file before adding to state
      const validFiles: File[] = [];

      for (const file of fileArray) {
        const result = imageFileSchema.safeParse(file);
        if (result.success) {
          validFiles.push(file);
        } else {
          const errorMsg = result.error.issues[0]?.message ?? 'Invalid file';
          toast.error(`"${file.name}": ${errorMsg}`);
        }
      }

      if (validFiles.length > 0) {
        clearErrors(name);
        dispatch({
          type: 'ADD_IMAGES',
          payload: { files: validFiles, remainingSlots },
        });
      }
    },
    [state.images, name, setError, clearErrors]
  );

  const removeImage = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_IMAGE', payload: { id } });
      clearErrors(name);
    },
    [name, clearErrors]
  );

  const setThumbnail = useCallback((id: string) => {
    dispatch({ type: 'SET_THUMBNAIL', payload: { id } });
  }, []);

  const reorderImages = useCallback((startIndex: number, endIndex: number) => {
    dispatch({ type: 'REORDER_IMAGES', payload: { startIndex, endIndex } });
  }, []);

  return {
    images: state.images,
    isDragging,
    setIsDragging,
    addImages,
    removeImage,
    setThumbnail,
    reorderImages,
  };
};
