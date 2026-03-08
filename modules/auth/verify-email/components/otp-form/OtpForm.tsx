'use client';

import { useTranslations } from 'next-intl';
import { FormProvider } from 'react-hook-form';
import { AlertCircle, Loader2, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOtpForm } from './hooks/useOtpForm';
import { OtpFormProps } from './types';
import OtpInput from './components/otp-input';
import CountDownTimer from './components/count-down-timer';
import { TOTAL_SECONDS } from './otpForm.constant';

export function OtpForm(props: OtpFormProps) {
  const t = useTranslations('Auth.verifyEmail');
  const {
    form,
    onSubmit,
    isSubmitting,
    serverError,
    remainingSeconds,
    resendCooldown,
    isResending,
    resendSuccess,
    isExpired,
    handleResend,
    otp,
  } = useOtpForm(props);

  const { errors, touchedFields } = form.formState;
  const hasError = !!(errors.otp && touchedFields.otp);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* OTP Input */}
        <div>
          <label className="text-foreground mb-3 block text-sm font-semibold">
            {t('verificationCode')}
          </label>
          <OtpInput
            value={otp}
            onChange={(value) =>
              form.setValue('otp', value, {
                shouldValidate: true,
                shouldTouch: true,
              })
            }
            disabled={isSubmitting || isExpired}
            hasError={hasError}
          />
          {hasError && (
            <p className="text-destructive mt-2 flex items-center text-sm">
              <AlertCircle className="me-1 h-4 w-4" />
              {errors.otp?.message}
            </p>
          )}
        </div>

        {/* Countdown Timer */}
        <CountDownTimer
          totalSeconds={TOTAL_SECONDS}
          remainingSeconds={remainingSeconds}
          onExpire={() => {}}
        />

        {/* Server Error */}
        {serverError && (
          <div className="bg-destructive/10 border-destructive/20 rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-destructive h-5 w-5" />
              <p className="text-destructive text-sm font-medium">
                {serverError}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || otp.length !== 6 || isExpired}
          className="from-primary to-secondary h-auto w-full rounded-xl bg-linear-to-r py-4 text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 h-5 w-5 animate-spin" />
              {t('verifying')}
            </>
          ) : isExpired ? (
            t('codeExpired')
          ) : (
            t('verifyEmail')
          )}
        </Button>

        {/* Resend Section */}
        <div className="bg-muted border-border rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Send className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-foreground text-sm font-semibold">
                  {t('didntReceiveCode')}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {t('checkSpamOrResend')}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="border-primary text-primary hover:bg-primary border-2 font-bold transition-all duration-200 hover:text-white"
            >
              {isResending ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('sending')}
                </>
              ) : resendCooldown > 0 ? (
                `${t('resend')} (${resendCooldown}s)`
              ) : (
                t('resendCode')
              )}
            </Button>
          </div>
        </div>

        {/* Resend Success */}
        {resendSuccess && (
          <div className="bg-success border-success-foreground/20 rounded-xl border-2 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-success-foreground h-5 w-5" />
              <div>
                <p className="text-success-foreground font-semibold">
                  {t('codeResentTitle')}
                </p>
                <p className="text-success-foreground/80 mt-0.5 text-sm">
                  {t('codeResentDescription')}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
