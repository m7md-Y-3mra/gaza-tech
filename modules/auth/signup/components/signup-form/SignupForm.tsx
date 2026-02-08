'use client';
import { AlertCircle, Mail, User, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSignupForm } from './hooks/useSignupForm';
import { Button } from '@/components/ui/button';
import { FormProvider } from 'react-hook-form';
import TextField from '@/components/text-field';
import CheckboxField from '@/components/checkbox-field';
import LoadingSubmittingSpinner from '@/components/loading-submitting-spinner';

const SignupForm = () => {
  const t = useTranslations('Auth');
  const { form, onSubmit, isSubmitting, serverError, passwordsMatch } =
    useSignupForm();

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-start gap-3 rounded-xl border p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label={t('signup.firstName')}
            name="firstName"
            placeholder={t('signup.firstNamePlaceholder')}
            Icon={User}
          />

          <TextField
            label={t('signup.lastName')}
            name="lastName"
            placeholder={t('signup.lastNamePlaceholder')}
            Icon={User}
          />
        </div>

        {/* Email Field */}
        <TextField
          label={t('common.email')}
          name="email"
          placeholder={t('common.emailPlaceholder')}
          Icon={Mail}
          type="email"
        />

        {/* Password Field */}
        <TextField
          label={t('common.password')}
          name="password"
          type="password"
          placeholder={t('signup.createPassword')}
          Icon={Lock}
          showStrength
        />

        {/* Confirm Password Field */}
        <TextField
          label={t('signup.confirmPassword')}
          name="confirmPassword"
          type="password"
          placeholder={t('signup.confirmPasswordPlaceholder')}
          Icon={Lock}
          isSuccess={passwordsMatch}
          successMessage={t('signup.passwordsMatch')}
        />

        {/* Terms Checkbox */}
        <CheckboxField name="terms">
          {t('signup.termsPrefix')}{' '}
          <a
            href="#"
            className="text-primary hover:text-secondary font-semibold transition-colors"
          >
            {t('signup.termsAndConditions')}
          </a>{' '}
          {t('signup.and')}{' '}
          <a
            href="#"
            className="text-primary hover:text-secondary font-semibold transition-colors"
          >
            {t('signup.privacyPolicy')}
          </a>
        </CheckboxField>

        {/* Newsletter Checkbox */}
        <CheckboxField name="newsletter">
          {t('signup.newsletter')}
        </CheckboxField>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="from-primary to-secondary h-12 w-full bg-linear-to-r text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <LoadingSubmittingSpinner />
              {t('signup.creatingAccount')}
            </span>
          ) : (
            t('signup.createAccount')
          )}
        </Button>
      </form>
    </FormProvider>
  );
};

export default SignupForm;
