'use client';

import { FormProvider } from 'react-hook-form';
import { AlertCircle, Loader2, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOtpForm } from './hooks/useOtpForm';
import { OtpFormProps } from './types';
import OtpInput from './components/otp-input';
import CountDownTimer from './components/count-down-timer';
import { TOTAL_SECONDS } from './otpForm.constant';

export function OtpForm(props: OtpFormProps) {
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
          <label className="block text-sm font-semibold text-foreground mb-3">
            Verification Code
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
            <p className="text-destructive text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
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
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-destructive text-sm font-medium">{serverError}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || otp.length !== 6 || isExpired}
          className="w-full bg-linear-to-r from-primary to-secondary text-white font-bold py-4 h-auto rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifying...
            </>
          ) : isExpired ? (
            'Code Expired'
          ) : (
            'Verify Email'
          )}
        </Button>

        {/* Resend Section */}
        <div className="bg-muted rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Send className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Didn&apos;t receive the code?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Check your spam folder or request a new code
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend (${resendCooldown}s)`
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>
        </div>

        {/* Resend Success */}
        {resendSuccess && (
          <div className="bg-success border-2 border-success-foreground/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success-foreground" />
              <div>
                <p className="text-success-foreground font-semibold">
                  Code Resent Successfully!
                </p>
                <p className="text-success-foreground/80 text-sm mt-0.5">
                  A new verification code has been sent to your email.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
