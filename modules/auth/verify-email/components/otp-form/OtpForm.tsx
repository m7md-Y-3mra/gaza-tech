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
          <label className="mb-3 block text-sm font-semibold text-gray-700">
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
            <p className="mt-2 flex items-center text-sm text-red-500">
              <AlertCircle className="mr-1 h-4 w-4" />
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
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-700">{serverError}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || otp.length !== 6 || isExpired}
          className="from-primary to-secondary h-auto w-full rounded-xl bg-gradient-to-r py-4 text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Send className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Didn&apos;t receive the code?
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
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
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  Code Resent Successfully!
                </p>
                <p className="mt-0.5 text-sm text-green-700">
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
