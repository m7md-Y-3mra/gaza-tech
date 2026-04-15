'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import TextField from '@/components/text-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { createCategoryAction, updateCategoryAction } from '../../actions';
import type { MarketplaceCategory } from '../../types';

const CategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  name_ar: z.string().trim().min(1, 'Arabic name is required').max(100),
  description: z.string().trim().max(500).optional(),
  icon_url: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

interface CategoryFormProps {
  category?: MarketplaceCategory;
  onSuccess: (item: MarketplaceCategory) => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const t = useTranslations('CategoryLocation');
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(category);

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: category?.name ?? '',
      name_ar: category?.name_ar ?? '',
      description: category?.description ?? '',
      icon_url: category?.icon_url ?? '',
      is_active: category?.is_active ?? true,
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const isActive = watch('is_active') ?? true;

  function onSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      const payload = {
        name: values.name,
        name_ar: values.name_ar,
        description: values.description?.trim() || undefined,
        icon_url: values.icon_url?.trim() || undefined,
        is_active: values.is_active,
      };

      const result = isEditing
        ? await updateCategoryAction(category!.marketplace_category_id, payload)
        : await createCategoryAction(payload);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        isEditing ? t('success.categoryUpdated') : t('success.categoryCreated')
      );
      onSuccess(result.data);
    });
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          name="name"
          label={t('form.nameEn')}
          placeholder={t('form.nameEnPlaceholder')}
          disabled={isPending}
        />
        <TextField
          name="name_ar"
          label={t('form.nameAr')}
          placeholder={t('form.nameArPlaceholder')}
          dir="rtl"
          disabled={isPending}
        />
        <TextField
          name="description"
          label={t('form.description')}
          placeholder={t('form.descriptionPlaceholder')}
          disabled={isPending}
        />
        <TextField
          name="icon_url"
          label={t('form.iconUrl')}
          placeholder={t('form.iconUrlPlaceholder')}
          disabled={isPending}
        />
        {isEditing && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={Boolean(isActive)}
              onCheckedChange={(checked) =>
                setValue('is_active', Boolean(checked))
              }
              disabled={isPending}
            />
            <Label htmlFor="is_active">{t('form.isActive')}</Label>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? t('form.updating')
                : t('form.creating')
              : t('form.save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
