'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FormProvider } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SelectField from '@/components/select-field/SelectField';
import TextAreaField from '@/components/text-area-field/TextAreaField';
import LoadingSubmittingSpinner from '@/components/loading-submitting-spinner/LoadingSubmittingSpinner';
import { ReportModalProps } from './types';
import { useReportModal } from './hooks/useReportModal';
import { REASON_OPTIONS } from './constant';

const ReportModal: React.FC<ReportModalProps> = ({
  contentType,
  contentId,
  isOpen,
  onClose,
}) => {
  const t = useTranslations('Report');
  const { form, onSubmit, isSubmitting } = useReportModal(
    contentType,
    contentId,
    onClose
  );

  const translatedOptions = REASON_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey as any),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-destructive/20 gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="bg-destructive/5 flex flex-col items-center p-6 pb-6 text-center">
          <div className="bg-destructive/10 ring-background/50 dark:ring-background/10 mb-4 rounded-full p-4 ring-8">
            <AlertTriangle className="text-destructive h-8 w-8" />
          </div>
          <DialogHeader className="items-center space-y-2">
            <DialogTitle className="text-2xl font-bold">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-base">
              {t('subtitle')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="bg-background space-y-6 p-6">
            <div className="space-y-5">
              <SelectField
                name="reason"
                label={t('reason')}
                placeholder={t('reason')}
                options={translatedOptions}
                disabled={isSubmitting}
              />

              <TextAreaField
                name="description"
                label={t('description')}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full sm:w-1/2"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="h-11 w-full sm:w-1/2"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSubmittingSpinner /> : t('submit')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
