'use client';

import { CloudUpload, RotateCw, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from '@/constants/image-file';
import { useFormContext } from 'react-hook-form';
import type { UploadImageProps } from './types';
import { useUploadImage } from './hooks/useUploadImage';

const UploadImage = ({
  id,
  name,
  label,
  description,
  required = false,
}: UploadImageProps) => {
  const {
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const {
    inputRef,
    isDragging,
    preview,
    handleInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemove,
    handleChange,
    hasImage,
  } = useUploadImage({ name });

  const error = errors[name];
  const touched = touchedFields[name];
  const hasError = (isSubmitted || touched) && !!error;

  return (
    <div className="upload-image-field">
      {/* Label Row */}
      <div className="mb-3 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-foreground flex items-center text-sm font-semibold"
        >
          {label}
          {required && <span className="ms-1 text-red-500">*</span>}
        </label>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {required ? 'Required' : 'Optional'}
        </span>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!hasImage ? handleChange : undefined}
        className={[
          'relative overflow-hidden rounded-2xl border-[3px] border-dashed p-8 text-center transition-all duration-200',
          !hasImage ? 'cursor-pointer' : 'cursor-default',
          isDragging
            ? 'border-primary bg-green-50 dark:bg-green-950/20'
            : hasError
              ? 'border-destructive bg-red-50/30 dark:bg-red-950/10'
              : !hasImage
                ? 'border-muted-foreground/30 hover:border-primary hover:bg-green-50 dark:hover:bg-green-950/20'
                : 'border-muted-foreground/30',
          'group',
        ].join(' ')}
        role={!hasImage ? 'button' : undefined}
        tabIndex={!hasImage ? 0 : undefined}
        onKeyDown={
          !hasImage ? (e) => e.key === 'Enter' && handleChange() : undefined
        }
        aria-label={!hasImage ? `Upload ${label}` : undefined}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept={ACCEPTED_FILE_TYPES.join(',')}
          className="hidden"
          onChange={handleInputChange}
        />

        {/* Placeholder state */}
        {!hasImage && (
          <div className="space-y-4">
            <div className="from-primary to-secondary mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md transition-transform duration-200 group-hover:scale-110">
              <CloudUpload className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-foreground mb-1 text-lg font-semibold">
                Click to upload or drag and drop
              </p>
              {description && (
                <p className="text-muted-foreground text-sm">{description}</p>
              )}
              <p className="text-muted-foreground/70 mt-2 text-xs">
                {ACCEPTED_FILE_TYPES.map((t) =>
                  t.split('/')[1]?.toUpperCase()
                ).join(' or ')}{' '}
                &bull; Max {MAX_UPLOAD_SIZE / 1_000_000}MB
              </p>
            </div>
          </div>
        )}

        {/* Preview state */}
        {hasImage && (
          <div>
            <Image
              src={preview!}
              alt={`${label} preview`}
              width={600}
              height={256}
              className="mx-auto max-h-64 w-auto rounded-xl object-contain shadow-md"
            />
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleChange}
                className="bg-primary hover:bg-secondary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200"
              >
                <RotateCw className="h-4 w-4" />
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p className="text-destructive mt-2 flex items-center gap-1 text-sm">
          {error?.message as string}
        </p>
      )}
    </div>
  );
};

export default UploadImage;
