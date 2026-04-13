import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { createReportSchema, CreateReportInput } from '../../../schema';
import { createReportAction } from '../../../actions';
import { ContentType } from '../types';

export const useReportModal = (
  contentType: ContentType,
  contentId: string,
  onClose: () => void
) => {
  const t = useTranslations('Report');
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      reason: undefined,
      description: '',
      reported_listing_id: contentType === 'listing' ? contentId : undefined,
      reported_post_id: contentType === 'post' ? contentId : undefined,
      reported_comment_id: contentType === 'comment' ? contentId : undefined,
      reported_user_id: contentType === 'user' ? contentId : undefined,
    },
  });

  const onSubmit = async (data: CreateReportInput) => {
    startTransition(async () => {
      const result = await createReportAction(data);

      console.log(result);
      if (result.success) {
        toast.success(t('success'));
        onClose();
        form.reset();
      } else {
        if (result.code === 'ALREADY_REPORTED') {
          toast.error(t('alreadyReported'));
        } else if (result.code === 'CONTENT_NOT_FOUND') {
          toast.error(t('errors.notFound'));
        } else {
          toast.error(result.message || t('errors.failed'));
        }
      }
    });
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: isPending,
  };
};
