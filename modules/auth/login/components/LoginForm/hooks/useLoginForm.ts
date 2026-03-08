'use client';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'nextjs-toploader/app';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { LoginFormSchemaType } from '../types';
import { createLoginFormSchema } from '../LoginForm.schema';
import { signIn } from '../actions';

export const useLoginForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('Auth.login.toast');
  const tValidation = useTranslations('Auth.login.validation');

  const schema = useMemo(
    () => createLoginFormSchema(tValidation),
    [tValidation]
  );

  const form = useForm<LoginFormSchemaType>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (values: LoginFormSchemaType) => {
    setServerError(null);

    const result = await signIn(values);

    if (!result.success) {
      setServerError(result.message);
      toast.error(result.message);
      return;
    }

    toast.success(t('success'));
    router.push('/');
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    serverError,
  };
};
