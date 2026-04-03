import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useMemo } from 'react';
import {
  createCreateCommunityPostClientSchema,
  createUpdateCommunityPostClientSchema,
} from '@/modules/community/schema';
import {
  createCommunityPostAction,
  updateCommunityPostAction,
} from '@/modules/community/actions';
import type { PostFormInitialData } from '../types';
import type {
  CreateCommunityPostFormData,
  UpdateCommunityPostFormData,
  FormMode,
} from '@/modules/community/types';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import { getDefaultValues } from '../constant';
import { useTranslations } from 'next-intl';
import { useFileUploader } from '@/components/file-upload';
import { extractPathFromUrl } from '@/utils/supabase';
import type { TranslationFunction } from '@/types';

type PostFormData = CreateCommunityPostFormData | UpdateCommunityPostFormData;

// Attachment types inferred from schemas (FileUploadItem without id)
type NewAttachment = {
  file: File;
  preview: string;
  isThumbnail: boolean;
  isExisting?: false;
};

type ExistingAttachment = {
  preview: string;
  isThumbnail: boolean;
  isExisting: true;
};

type Attachment = NewAttachment | ExistingAttachment;

export const usePostForm = (
  mode: FormMode,
  postId?: string,
  initialData?: PostFormInitialData
) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const tValidation = useTranslations('PostForm.validation');
  const tToast = useTranslations('PostForm.toast');

  const { uploadFiles, deleteFiles, isUploading, uploadError } =
    useFileUploader({
      bucketName: 'community-attachments',
      pathPrefix: 'community/',
      enableCompression: false,
    });

  const schema = useMemo(() => {
    return mode === 'create'
      ? createCreateCommunityPostClientSchema(
          tValidation as unknown as TranslationFunction
        )
      : createUpdateCommunityPostClientSchema(
          tValidation as unknown as TranslationFunction
        );
  }, [mode, tValidation]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialData),
    mode: 'onBlur',
  });

  const initialAttachmentUrls = useMemo(() => {
    if (mode === 'update' && initialData?.attachments) {
      return initialData.attachments.map((att) => att.preview);
    }
    return [];
  }, [mode, initialData?.attachments]);

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    let uploadedPaths: string[] = [];

    try {
      if (mode === 'create') {
        const createData = data as CreateCommunityPostFormData;
        const { attachments, ...postData } = createData;
        let uploadResults: { url: string }[] = [];

        if (attachments && attachments.length > 0) {
          const rawResults = await uploadFiles(
            attachments.map((att) => ({ file: att.file }))
          );
          uploadResults = rawResults.map((r) => ({ url: r.url }));
          uploadedPaths = rawResults.map((r) => r.path);
        }

        const result = await createCommunityPostAction({
          ...postData,
          attachments: uploadResults.length > 0 ? uploadResults : undefined,
        });

        if (!result.success) {
          if (uploadedPaths.length > 0) {
            await deleteFiles(uploadedPaths);
          }
          setSubmitError(result.message || tToast('createError'));
          return;
        }

        toast.success(tToast('createSuccess'));
        startTransition(() => {
          router.push(`/community`);
        });
      } else if (mode === 'update' && postId) {
        const updateData = data as UpdateCommunityPostFormData;
        const { attachments: formAttachments, ...postData } = updateData;
        const attachments = (formAttachments ?? []) as Attachment[];

        const existingAttachments = attachments.filter(
          (att): att is ExistingAttachment => att.isExisting === true
        );

        const newAttachments = attachments.filter(
          (att): att is NewAttachment => att.isExisting !== true
        );

        const currentExistingUrls = new Set(
          existingAttachments.map((att) => att.preview)
        );
        const removedAttachmentUrls = initialAttachmentUrls.filter(
          (url) => !currentExistingUrls.has(url)
        );

        const removedPaths = removedAttachmentUrls
          .map((url) => extractPathFromUrl(url))
          .filter((path): path is string => path !== null);

        if (removedPaths.length > 0) {
          try {
            await deleteFiles(removedPaths);
          } catch (error) {
            console.error('Failed to delete removed attachments:', error);
          }
        }

        let uploadResults: { url: string; isExisting: boolean }[] = [];
        if (newAttachments.length > 0) {
          const rawUploadResults = await uploadFiles(
            newAttachments.map((att) => ({ file: att.file }))
          );
          uploadResults = rawUploadResults.map((result) => ({
            url: result.url,
            isExisting: false,
          }));
          uploadedPaths = rawUploadResults.map((r) => r.path);
        }

        const allAttachments = [
          ...existingAttachments.map((att) => ({
            url: att.preview,
            isExisting: true as const,
          })),
          ...uploadResults,
        ];

        const result = await updateCommunityPostAction(postId, {
          ...postData,
          attachments: allAttachments.length > 0 ? allAttachments : undefined,
        });

        if (!result.success) {
          if (uploadedPaths.length > 0) {
            await deleteFiles(uploadedPaths);
          }
          setSubmitError(result.message || tToast('updateError'));
          return;
        }

        toast.success(tToast('updateSuccess'));
        startTransition(() => {
          router.push(`/community`);
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);

      if (uploadedPaths.length > 0) {
        await deleteFiles(uploadedPaths);
      }

      setSubmitError(
        error instanceof Error ? error.message : tToast('unexpectedError')
      );
      toast.error(tToast('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return {
    form,
    isSubmitting: isSubmitting || isUploading,
    submitError: submitError || uploadError,
    onSubmit: form.handleSubmit(
      onSubmit as unknown as Parameters<typeof form.handleSubmit>[0]
    ),
    handleCancel,
    isPending,
  };
};
