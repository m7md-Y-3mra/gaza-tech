"use client";

import { FormProvider } from "react-hook-form";
import { AlertCircle, Loader2, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOtpForm } from "./hooks/useOtpForm";
import { OtpFormProps } from "./types";
import OtpInput from "./components/otp-input";
import CountDownTimer from "./components/count-down-timer";
import { TOTAL_SECONDS } from "./otpForm.constant";

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
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Verification Code
          </label>
          <OtpInput
            value={otp}
            onChange={(value) => form.setValue("otp", value, { shouldValidate: true, shouldTouch: true })}
            disabled={isSubmitting || isExpired}
            hasError={hasError}
          />
          {hasError && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 text-sm font-medium">{serverError}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || otp.length !== 6 || isExpired}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 h-auto rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </>
          ) : isExpired ? (
            "Code Expired"
          ) : (
            "Verify Email"
          )}
        </Button>

        {/* Resend Section */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Send className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Didn&apos;t receive the code?
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Check your spam folder or request a new code
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-200"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend (${resendCooldown}s)`
              ) : (
                "Resend Code"
              )}
            </Button>
          </div>
        </div>

        {/* Resend Success */}
        {resendSuccess && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-900 font-semibold">
                  Code Resent Successfully!
                </p>
                <p className="text-green-700 text-sm mt-0.5">
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
