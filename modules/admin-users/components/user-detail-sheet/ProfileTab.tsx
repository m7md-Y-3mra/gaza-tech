'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { editUserAction } from '@/modules/admin-users/actions';
import type { AdminUser } from '@/modules/admin-users/types';

const ProfileFormSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  isVerified: z.boolean(),
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

interface ProfileTabProps {
  user: AdminUser;
  onMutationSuccess: () => void;
}

export function ProfileTab({ user, onMutationSuccess }: ProfileTabProps) {
  const t = useTranslations('AdminUsers');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      firstName: user.first_name,
      lastName: user.last_name,
      isVerified: user.is_verified,
    },
  });

  const isVerified = watch('isVerified');

  async function onSubmit(values: ProfileFormValues) {
    const result = await editUserAction({
      targetUserId: user.user_id,
      firstName: values.firstName,
      lastName: values.lastName,
      isVerified: values.isVerified,
    });

    if (result.success) {
      toast.success(t('userDetail.profile.success'));
      onMutationSuccess();
    } else {
      toast.error(result.message ?? t('userDetail.profile.error'));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-first-name">
          {t('userDetail.profile.firstName')}
        </Label>
        <input
          id="profile-first-name"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...register('firstName')}
        />
        {errors.firstName && (
          <p className="text-destructive text-sm">{errors.firstName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-last-name">
          {t('userDetail.profile.lastName')}
        </Label>
        <input
          id="profile-last-name"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...register('lastName')}
        />
        {errors.lastName && (
          <p className="text-destructive text-sm">{errors.lastName.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="profile-is-verified"
          checked={isVerified}
          onCheckedChange={(checked) =>
            setValue('isVerified', Boolean(checked), { shouldDirty: true })
          }
        />
        <Label htmlFor="profile-is-verified" className="cursor-pointer">
          {t('userDetail.profile.isVerified')}
        </Label>
      </div>

      <Button
        type="submit"
        disabled={!isDirty || isSubmitting}
        className="w-full"
      >
        {t('userDetail.profile.save')}
      </Button>
    </form>
  );
}
