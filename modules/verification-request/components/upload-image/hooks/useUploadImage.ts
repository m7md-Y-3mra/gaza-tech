import { useReducer, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { imageFileSchema } from '@/schemas/image-file';
import { uploadImageReducer } from '../reducers';
import type { UseUploadImageProps } from '../types';

export const useUploadImage = ({ name }: UseUploadImageProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { setValue, setError, clearErrors } = useFormContext();

    const [state, dispatch] = useReducer(uploadImageReducer, {
        preview: null,
        isDragging: false,
    });

    const handleFile = useCallback(
        (file: File | null) => {
            if (!file) {
                dispatch({ type: 'CLEAR_PREVIEW' });
                setValue(name, null, { shouldTouch: true, shouldDirty: true, shouldValidate: true });
                return;
            }

            // Validate with Zod schema
            const result = imageFileSchema.safeParse(file);
            if (!result.success) {
                const message = result.error.issues[0]?.message ?? 'Invalid file';
                toast.error(`"${file.name}": ${message}`);
                setError(name, { type: 'manual', message });
                return;
            }

            clearErrors(name);

            const reader = new FileReader();
            reader.onload = (e) => {
                dispatch({ type: 'SET_PREVIEW', payload: { preview: e.target?.result as string } });
            };
            reader.readAsDataURL(file);

            setValue(name, file, { shouldTouch: true, shouldDirty: true, shouldValidate: true });
        },
        [name, setValue, setError, clearErrors],
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_DRAGGING', payload: { isDragging: true } });
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_DRAGGING', payload: { isDragging: false } });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_DRAGGING', payload: { isDragging: false } });
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFile(file);
    };

    const handleRemove = () => {
        dispatch({ type: 'CLEAR_PREVIEW' });
        clearErrors(name);
        setValue(name, null, { shouldTouch: true, shouldDirty: true, shouldValidate: true });
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleChange = () => {
        inputRef.current?.click();
    };

    const hasImage = state.preview !== null;

    return {
        inputRef,
        isDragging: state.isDragging,
        preview: state.preview,
        handleInputChange,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleRemove,
        handleChange,
        hasImage,
    };
};