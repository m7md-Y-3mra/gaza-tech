// components/file-upload/hooks/useFileUpload.ts

import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import type { UseFileUploadProps } from '../types';
import { fileReducer } from '../reducers';

export const useFileUpload = (
  props: UseFileUploadProps & {
    t: (key: string, values?: Record<string, string>) => string;
  }
) => {
  const { mode, name, config, t } = props;
  const initialFiles = mode === 'update' ? props.initialFiles : [];
  const { setValue, setError, clearErrors } = useFormContext();

  const [state, dispatch] = useReducer(fileReducer, { files: initialFiles });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync the reducer state to react-hook-form
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const files = state.files.map(({ id: _id, ...rest }) => rest);
    setValue(name, files, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [state.files, setValue, name]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = config.maxFiles - state.files.length;

      if (remainingSlots <= 0) {
        setError(name, {
          type: 'manual',
          message: t('maxFilesReached', { max: String(config.maxFiles) }),
        });
        return;
      }

      // Validate each file before adding to state
      const validFiles: File[] = [];

      for (const file of fileArray) {
        // Check MIME type
        if (!config.acceptedTypes.includes(file.type)) {
          toast.error(t('invalidFileType', { name: file.name }));
          continue;
        }

        // Check max size
        if (file.size > config.maxSizeBytes) {
          const maxMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(0);
          toast.error(t('fileTooLarge', { name: file.name, maxSize: maxMB }));
          continue;
        }

        // Check min size (optional)
        if (config.minSizeBytes && file.size < config.minSizeBytes) {
          const minKB = (config.minSizeBytes / 1000).toFixed(0);
          toast.error(t('fileTooSmall', { name: file.name, minSize: minKB }));
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        clearErrors(name);
        dispatch({
          type: 'ADD_FILES',
          payload: {
            files: validFiles,
            remainingSlots,
            displayMode: config.displayMode,
          },
        });
      }
    },
    [state.files, name, config, setError, clearErrors, t]
  );

  const removeFile = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_FILE', payload: { id } });
      clearErrors(name);
    },
    [name, clearErrors]
  );

  const setThumbnail = useCallback((id: string) => {
    dispatch({ type: 'SET_THUMBNAIL', payload: { id } });
  }, []);

  const reorderFiles = useCallback((startIndex: number, endIndex: number) => {
    dispatch({
      type: 'REORDER_FILES',
      payload: { startIndex, endIndex },
    });
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!props.disabled) {
        setIsDragging(true);
      }
    },
    [props.disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!props.disabled && e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [props.disabled, addFiles]
  );

  return {
    files: state.files,
    isDragging,
    addFiles,
    removeFile,
    setThumbnail,
    reorderFiles,
    fileInputRef,
    openFilePicker,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};
