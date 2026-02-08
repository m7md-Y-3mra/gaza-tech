'use client';
import { useFormContext } from 'react-hook-form';
import {
  AlertCircle,
  CloudUpload,
  FolderOpen,
  Plus,
  Trash,
} from 'lucide-react';
import { useImageUpload } from './hooks/useImageUpload';
import type { ImageUploadProps } from './types';
import Image from 'next/image';
import {
  ACCEPTED_FILE_TYPES,
  MAX_IMAGES_NUMBER,
  MAX_UPLOAD_SIZE,
} from '@/constants/image-file';

const ImageUpload: React.FC<ImageUploadProps> = ({
  name,
  disabled = false,
}) => {
  const {
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const {
    images,
    isDragging,
    setIsDragging,
    addImages,
    removeImage,
    setThumbnail,
  } = useImageUpload(name);

  const error = errors[name];
  const touched = touchedFields[name];
  const hasError = (isSubmitted || touched) && !!error;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      addImages(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(e.target.files);
    }
  };

  return (
    <div>
      {/* Upload Area - Only show when not at max */}
      {images.length < MAX_IMAGES_NUMBER && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-muted-foreground/30 relative mb-6 cursor-pointer rounded-xl border-3 border-dashed p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-green-50'
              : 'hover:border-primary hover:bg-green-50'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Upload images"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center">
            <div className="from-primary to-secondary mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg">
              <CloudUpload className="h-9 w-9 text-white" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-bold">
              Upload Product Images
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop or click to browse
            </p>
            <button
              type="button"
              className="bg-muted text-foreground hover:bg-muted/80 flex rounded-xl px-6 py-3 font-semibold transition-all duration-200"
            >
              <FolderOpen className="mr-2 h-5 w-5" /> Choose Files
            </button>
            <p className="text-muted-foreground mt-4 text-xs">
              Supported formats:{' '}
              {ACCEPTED_FILE_TYPES.map((type) => type.split('/')[1]).join(', ')}{' '}
              (Max {MAX_UPLOAD_SIZE}MB each)
            </p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="mb-6 grid grid-cols-5 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative">
              <div
                className={`bg-muted aspect-square overflow-hidden rounded-xl ${
                  image.isThumbnail
                    ? 'border-primary border-2'
                    : 'border-2 border-transparent'
                }`}
              >
                <Image
                  src={image.preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  fill
                />
              </div>

              {/* Cover Badge */}
              {image.isThumbnail && (
                <div className="bg-primary absolute top-2 left-2 rounded-md px-2 py-1 text-xs font-bold text-white">
                  Cover
                </div>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                disabled={disabled}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600"
              >
                <Trash className="h-5 w-5" />
              </button>

              {/* Set as Cover Button - Only show on hover if not already cover */}
              {!image.isThumbnail && (
                <div className="absolute right-2 bottom-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setThumbnail(image.id)}
                    disabled={disabled}
                    className="bg-card bg-opacity-90 text-foreground hover:bg-opacity-100 w-full rounded py-1 text-xs"
                  >
                    Set as Cover
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: MAX_IMAGES_NUMBER - images.length }).map(
            (_, index) => (
              <div
                key={`empty-${index}`}
                onClick={() =>
                  document
                    .querySelector<HTMLInputElement>('input[type="file"]')
                    ?.click()
                }
                className="border-muted-foreground/30 bg-muted/30 hover:border-primary flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 hover:bg-green-50"
              >
                <i className="fa-solid fa-plus text-muted-foreground/50 text-2xl"></i>
                <Plus className="text-muted-foreground h-5 w-5" />
              </div>
            )
          )}
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="text-destructive mb-4 flex items-center gap-2 text-sm">
          <span>
            {Array.isArray(error) ? (
              error?.map((err, index) => (
                <div key={index} className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>
                    File{index + 1}: {err.file.message}
                  </p>
                </div>
              ))
            ) : (
              <p>{error?.message as string}</p>
            )}
          </span>
        </div>
      )}

      {/* Image Count Badge */}
      {images.length > 0 && (
        <div className="flex justify-end">
          <div className="rounded-lg bg-green-50 px-4 py-2">
            <span className="text-primary text-sm font-semibold">
              {images.length}/{MAX_IMAGES_NUMBER} Images
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
