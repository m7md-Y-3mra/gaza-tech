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
import { createLocationAction, updateLocationAction } from '../../actions';
import type { Location } from '../../types';

const LocationFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  name_ar: z.string().trim().min(1, 'Arabic name is required').max(100),
  sort_order: z.number().int().min(0).optional().nullable(),
  is_active: z.boolean().optional(),
});

type LocationFormValues = z.infer<typeof LocationFormSchema>;

interface LocationFormProps {
  location?: Location;
  onSuccess: (item: Location) => void;
  onCancel: () => void;
}

export function LocationForm({
  location,
  onSuccess,
  onCancel,
}: LocationFormProps) {
  const t = useTranslations('CategoryLocation');
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(location);

  const methods = useForm<LocationFormValues>({
    resolver: zodResolver(LocationFormSchema),
    defaultValues: {
      name: location?.name ?? '',
      name_ar: location?.name_ar ?? '',
      sort_order: location?.sort_order ?? undefined,
      is_active: location?.is_active ?? true,
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const isActive = watch('is_active') ?? true;

  function onSubmit(values: LocationFormValues) {
    startTransition(async () => {
      const payload = {
        name: values.name,
        name_ar: values.name_ar,
        sort_order: values.sort_order ?? undefined,
        is_active: values.is_active,
      };

      const result = isEditing
        ? await updateLocationAction(location!.location_id, payload)
        : await createLocationAction(payload);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        isEditing ? t('success.locationUpdated') : t('success.locationCreated')
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
          name="sort_order"
          label={t('form.sortOrder')}
          placeholder={t('form.sortOrderPlaceholder')}
          type="number"
          valueAsNumber
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
