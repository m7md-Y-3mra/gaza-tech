'use client';

import { useFormContext } from 'react-hook-form';
import {
  AlertCircle,
  CloudUpload,
  FileText as FileTextIcon,
  FolderOpen,
  ImageOff,
  Plus,
  Trash,
} from 'lucide-react';
import { useFileUpload } from './hooks/useFileUpload';
import type { FileUploadProps, FileUploadItem } from './types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// ─── Helper ──────────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const FileUpload: React.FC<FileUploadProps> = (props) => {
  const { mode, name, config, disabled = false } = props;
  const initialFiles = (
    mode === 'update' ? props.initialFiles : []
  ) as FileUploadItem[];

  const {
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const t = useTranslations('FileUpload');

  const {
    files,
    isDragging,
    addFiles,
    removeFile,
    setThumbnail,
    fileInputRef,
    openFilePicker,
    dragHandlers,
  } = useFileUpload(
    mode === 'create'
      ? { mode, name, config, disabled, t }
      : { mode, name, config, disabled, initialFiles, t }
  );

  const error = errors[name];
  const touched = touchedFields[name];
  const hasError = (isSubmitted || touched) && !!error;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  // ─── File-List Mode ──────────────────────────────────────────────────────
  if (config.displayMode === 'file-list') {
    return (
      <div>
        {/* Upload Area - Only show when not at max */}
        {files.length < config.maxFiles && (
          <div
            role="region"
            aria-label={t('uploadTitle')}
            onDragOver={dragHandlers.onDragOver}
            onDragLeave={dragHandlers.onDragLeave}
            onDrop={dragHandlers.onDrop}
            className={`border-muted-foreground/30 relative mb-4 cursor-pointer rounded-xl border-3 border-dashed p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-green-50'
                : 'hover:border-primary hover:bg-green-50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={config.acceptedTypes.join(',')}
              multiple
              disabled={disabled}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label={t('uploadTitle')}
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center">
              <CloudUpload className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-foreground text-sm font-medium">
                {t('dragDrop')}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t('supportedFormats', {
                  formats: config.acceptedTypes
                    .map((type) => type.split('/')[1])
                    .join(', '),
                  maxSize: String(config.maxSizeBytes / (1024 * 1024)),
                })}
              </p>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <ul className="mb-4 space-y-2">
            {files.map((file) => {
              const isImage =
                !file.isExisting && 'file' in file
                  ? file.file.type.startsWith('image/')
                  : file.preview.match(
                      /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i
                    ) !== null;

              return (
                <li
                  key={file.id}
                  className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
                >
                  {/* Preview: image thumbnail or file icon */}
                  <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    {isImage ? (
                      <>
                        <Image
                          src={file.preview}
                          alt={
                            !file.isExisting && 'file' in file
                              ? file.file.name
                              : 'Uploaded file'
                          }
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback)
                              (fallback as HTMLElement).style.display = 'flex';
                          }}
                        />
                        <div className="hidden h-full w-full items-center justify-center">
                          <ImageOff className="text-muted-foreground h-6 w-6" />
                        </div>
                      </>
                    ) : (
                      <FileTextIcon className="text-muted-foreground h-6 w-6" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {!file.isExisting && 'file' in file
                        ? file.file.name
                        : (file.preview.split('/').pop() ?? 'File')}
                    </p>
                    {!file.isExisting && 'file' in file && (
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(file.file.size)}
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    disabled={disabled}
                    aria-label={t('removeFile')}
                    className="text-muted-foreground hover:text-destructive shrink-0 p-1 transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Error Message */}
        {hasError && (
          <div className="text-destructive mb-4 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <p>{error?.message as string}</p>
          </div>
        )}

        {/* File Count */}
        {files.length > 0 && (
          <div className="flex justify-end">
            <span className="text-muted-foreground text-xs">
              {t('fileCount', {
                count: String(files.length),
                max: String(config.maxFiles),
              })}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ─── Image-Grid Mode ─────────────────────────────────────────────────────
  return (
    <div>
      {/* Upload Area - Only show when not at max */}
      {files.length < config.maxFiles && (
        <div
          role="region"
          aria-label={t('uploadTitle')}
          onClick={disabled ? undefined : openFilePicker}
          onDragOver={dragHandlers.onDragOver}
          onDragLeave={dragHandlers.onDragLeave}
          onDrop={dragHandlers.onDrop}
          className={`border-muted-foreground/30 relative mb-6 cursor-pointer rounded-xl border-3 border-dashed p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-green-50'
              : 'hover:border-primary hover:bg-green-50'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={config.acceptedTypes.join(',')}
            multiple
            disabled={disabled}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFileInput}
          />
          <div className="flex flex-col items-center">
            <div className="from-primary to-secondary mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg">
              <CloudUpload className="h-9 w-9 text-white" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-bold">
              {t('uploadTitle')}
            </h3>
            <p className="text-muted-foreground mb-4">{t('dragDrop')}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker();
              }}
              disabled={disabled}
              aria-label={t('chooseFiles')}
              className="bg-muted text-foreground hover:bg-muted/80 flex rounded-xl px-6 py-3 font-semibold transition-all duration-200"
            >
              <FolderOpen className="me-2 h-5 w-5" /> {t('chooseFiles')}
            </button>
            <p className="text-muted-foreground mt-4 text-xs">
              {t('supportedFormats', {
                formats: config.acceptedTypes
                  .map((type) => type.split('/')[1])
                  .join(', '),
                maxSize: String(config.maxSizeBytes / (1024 * 1024)),
              })}
            </p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {files.length > 0 && (
        <div className="mb-6 grid grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group relative">
              <div
                className={`bg-muted relative aspect-square overflow-hidden rounded-xl ${
                  file.isThumbnail
                    ? 'border-primary border-2'
                    : 'border-2 border-transparent'
                }`}
              >
                <Image
                  src={file.preview}
                  alt={
                    !file.isExisting && 'file' in file
                      ? file.file.name
                      : 'Uploaded file'
                  }
                  className="h-full w-full object-cover"
                  fill
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback)
                      (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
                <div className="hidden h-full w-full items-center justify-center">
                  <ImageOff className="text-muted-foreground h-8 w-8" />
                </div>
              </div>

              {/* Cover Badge */}
              {file.isThumbnail && (
                <div className="bg-primary absolute start-2 top-2 rounded-md px-2 py-1 text-xs font-bold text-white">
                  {t('cover')}
                </div>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                disabled={disabled}
                aria-label={t('removeFile')}
                className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600"
              >
                <Trash className="h-5 w-5" />
              </button>

              {/* Set as Cover Button */}
              {!file.isThumbnail && (
                <div className="absolute start-2 end-2 bottom-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setThumbnail(file.id)}
                    disabled={disabled}
                    className="bg-card bg-opacity-90 text-foreground hover:bg-opacity-100 w-full rounded py-1 text-xs"
                  >
                    {t('setAsCover')}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: config.maxFiles - files.length }).map(
            (_, index) => (
              <div
                key={`empty-${index}`}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={t('chooseFiles')}
                onClick={disabled ? undefined : openFilePicker}
                onKeyDown={(e) => {
                  if (!disabled && (e.key === 'Enter' || e.key === ' '))
                    openFilePicker();
                }}
                className={`border-muted-foreground/30 bg-muted/30 flex aspect-square items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                  disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-primary cursor-pointer hover:bg-green-50'
                }`}
              >
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
                    {t('fileError', {
                      index: String(index + 1),
                      message: err?.file?.message ?? err?.message ?? '',
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p>{error?.message as string}</p>
            )}
          </span>
        </div>
      )}

      {/* File Count Badge */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <div className="rounded-lg bg-green-50 px-4 py-2">
            <span className="text-primary text-sm font-semibold">
              {t('fileCount', {
                count: String(files.length),
                max: String(config.maxFiles),
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
