'use client';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { AlertCircle, Upload, X, Star } from 'lucide-react';
import { useImageUpload } from './hooks/useImageUpload';
import type { ImageUploadProps } from './types';

const ImageUpload: React.FC<ImageUploadProps> = ({
  name,
  label = 'Product Images',
  maxImages = 5,
  maxSizeMB = 5,
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
  } = useImageUpload(name, maxImages, maxSizeMB);

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
      <Label className="mb-2 block text-sm font-semibold">{label}</Label>
      <p className="text-muted-foreground mb-4 text-sm">
        Upload up to {maxImages} images. First image will be the thumbnail.
      </p>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-muted-foreground relative mb-4 flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : ''
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-primary'}`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Upload images"
          />
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <Upload className="h-8 w-8" />
            <p className="text-sm">
              Drag & drop images or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs">Max {maxSizeMB}MB per image</p>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group border-border relative aspect-square overflow-hidden rounded-lg border-2"
            >
              <img
                src={image.preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />

              {/* Thumbnail Badge */}
              {image.isThumbnail && (
                <div className="bg-primary absolute top-2 left-2 flex items-center gap-1 rounded px-2 py-1 text-xs text-white">
                  <Star className="h-3 w-3 fill-current" />
                  Thumbnail
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {!image.isThumbnail && (
                  <button
                    type="button"
                    onClick={() => setThumbnail(image.id)}
                    disabled={disabled}
                    className="rounded bg-white px-3 py-1 text-xs font-medium text-black hover:bg-gray-200"
                  >
                    Set as Thumbnail
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  disabled={disabled}
                  className="bg-destructive hover:bg-destructive/90 flex items-center gap-1 rounded px-3 py-1 text-xs font-medium text-white"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="text-destructive mt-2 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error?.message as string}</span>
        </div>
      )}

      {/* Image Count */}
      {images.length > 0 && (
        <p className="text-muted-foreground mt-2 text-sm">
          {images.length} / {maxImages} images uploaded
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
