'use client';

import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import TextField from '@/components/text-field';
import TextAreaField from '@/components/text-area-field';
import { CategoryRadioField } from './components/category-radio-field';
import { usePostForm } from './hooks/usePostForm';
import { PostFormClientProps } from './types';
import { useTranslations } from 'next-intl';
import { FileUpload } from '@/components/file-upload';
import { communityFileUploadConfig } from './constant';

export const PostFormClient = (props: PostFormClientProps) => {
  const { mode } = props;
  const postId = mode === 'update' ? props.postId : undefined;
  const initialData = mode === 'update' ? props.initialData : undefined;

  const t = useTranslations('PostForm');

  const { form, isSubmitting, submitError, onSubmit, handleCancel, isPending } =
    usePostForm(mode, postId, initialData);

  const isUpdate = mode === 'update';
  const isLoading = isSubmitting || isPending;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6 lg:p-8"
      >
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            {isUpdate ? t('titleUpdate') : t('titleCreate')}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {isUpdate ? t('descriptionUpdate') : t('descriptionCreate')}
          </p>
        </div>

        {submitError && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm font-medium">{submitError}</p>
          </div>
        )}

        <div className="space-y-6">
          <TextField
            name="title"
            label={t('fields.title')}
            placeholder={t('placeholders.title')}
            disabled={isLoading}
            maxLength={100}
          />

          <CategoryRadioField
            name="post_category"
            label={t('fields.category')}
          />

          <TextAreaField
            name="content"
            label={t('fields.content')}
            placeholder={t('placeholders.content')}
            disabled={isLoading}
            maxLength={5000}
          />

          <div className="space-y-3">
            <label className="text-sm font-semibold">
              {t('fields.attachments')}
            </label>
            {mode === 'create' ? (
              <FileUpload
                name="attachments"
                config={communityFileUploadConfig}
                mode="create"
                disabled={isLoading}
              />
            ) : (
              <FileUpload
                name="attachments"
                config={communityFileUploadConfig}
                mode="update"
                initialFiles={initialData?.attachments || []}
                disabled={isLoading}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {t('buttons.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? isUpdate
                ? t('buttons.updating')
                : t('buttons.publishing')
              : isUpdate
                ? t('buttons.update')
                : t('buttons.publish')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
