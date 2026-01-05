'use client';
import { AlertCircle, Mail, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import TextField from '@/components/text-field';
import CheckboxField from '@/components/checkbox-field';
import { useLoginForm } from './hooks/useLoginForm';

const LoginForm = () => {
  const t = useTranslations('Auth');
  const { form, onSubmit, isSubmitting, serverError } = useLoginForm();

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-start gap-3 rounded-xl border p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        <TextField
          label={t('common.email')}
          name="email"
          type="email"
          placeholder={t('common.emailPlaceholder')}
          Icon={Mail}
        />

        <TextField
          label={t('common.password')}
          name="password"
          type="password"
          placeholder={t('common.passwordPlaceholder')}
          Icon={Lock}
        />

        <div className="flex items-center justify-between">
          <CheckboxField name="remember">{t('login.rememberMe')}</CheckboxField>
          <Link
            href="/forgot-password"
            className="text-primary hover:text-secondary text-sm font-semibold transition-colors"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="from-primary to-secondary h-12 w-full bg-linear-to-r text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('login.signingIn')}
            </span>
          ) : (
            t('login.signIn')
          )}
        </Button>
      </form>
    </FormProvider>
  );
};

export default LoginForm;
