'use client';

import {
  CheckCircle2,
  Clock,
  Loader2,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { OtpVerifyProps } from './types';
import { useOtpVerify } from './hooks/useOtpVerify';

const OTP_LENGTH = 6;

const OtpVerify = ({
  name,
  phone,
  initialVerified = false,
  onVerified,
}: OtpVerifyProps) => {
  const {
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const {
    step,
    digits,
    isSending,
    isVerifying,
    secondsLeft,
    formattedTimer,
    canResend,
    sendOtp,
    verifyOtp,
    handleDigitChange,
    handleDigitKeyDown,
    setInputRef,
  } = useOtpVerify({ name, phone, initialVerified, onVerified });

  const error = errors[name];
  const touched = touchedFields[name];
  const hasError = (isSubmitted || touched) && !!error;

  // ─── Already Verified Fallback ───────────────────────────────────────
  if (step === 'verified') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500">
          <CheckCircle2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-green-900 dark:text-green-100">
            Phone Verified Successfully!
          </p>
          <p className="text-sm text-green-800 dark:text-green-200">
            {phone} has been verified
          </p>
        </div>
        <ShieldCheck className="ms-auto h-5 w-5 text-green-500" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/30">
      {/* Phone + Send OTP Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="from-primary to-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Phone Number
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {phone || '+970 59 XXX XXXX'}
            </p>
          </div>
        </div>

        {step === 'idle' && (
          <button
            type="button"
            onClick={sendOtp}
            disabled={isSending || !phone}
            className="from-primary to-secondary flex items-center gap-2 rounded-lg bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSending ? 'Sending…' : 'Send OTP'}
          </button>
        )}

        {step === 'sent' && (
          <button
            type="button"
            onClick={sendOtp}
            disabled={!canResend || isSending}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Resend OTP
          </button>
        )}
      </div>

      {/* OTP Input Section */}
      {step === 'sent' && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Enter OTP Code
            </label>

            {/* 6-digit boxes */}
            <div className="flex items-center gap-3">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => setInputRef(i, el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={OTP_LENGTH} // allows paste of full code
                  value={digits[i]}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  className={[
                    'h-14 w-14 rounded-xl border-2 text-center text-2xl font-bold transition-all duration-200 focus:outline-none',
                    hasError
                      ? 'border-destructive focus:border-destructive focus:ring-red-100'
                      : digits[i]
                        ? 'border-primary focus:border-primary focus:ring-4 focus:ring-green-100'
                        : 'focus:border-primary border-gray-300 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
                  ].join(' ')}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            {/* Error message */}
            {hasError && (
              <p className="text-destructive mt-2 text-sm">
                {error?.message as string}
              </p>
            )}

            {/* Timer */}
            {secondsLeft > 0 && (
              <p className="mt-3 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                Code expires in{' '}
                <span className="text-primary font-semibold">
                  {formattedTimer}
                </span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={verifyOtp}
              disabled={isVerifying || digits.join('').length < OTP_LENGTH}
              className="from-primary to-secondary flex items-center gap-2 rounded-lg bg-gradient-to-r px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {isVerifying ? 'Verifying…' : 'Verify OTP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpVerify;
