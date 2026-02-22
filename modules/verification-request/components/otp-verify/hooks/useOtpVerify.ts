'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { OtpStep, UseOtpVerifyProps } from '../types';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 300; // 5 minutes

export const useOtpVerify = ({
  name,
  phone,
  initialVerified = false,
  onVerified,
}: UseOtpVerifyProps) => {
  const { setValue, setError, clearErrors } = useFormContext();

  // Initialise as verified if the user already passed verification
  const [step, setStep] = useState<OtpStep>(
    initialVerified ? 'verified' : 'idle'
  );
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    Array(OTP_LENGTH).fill(null)
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync the already-verified state into the form on mount
  useEffect(() => {
    if (initialVerified) {
      setValue(name, true, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [initialVerified, name, setValue]);

  // Countdown timer
  const startCountdown = useCallback(() => {
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    []
  );

  const formattedTimer = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const canResend = secondsLeft === 0 && step === 'sent';

  // ─── Send OTP ─────────────────────────────────────────────────────────
  // Uses updateUser({ phone }) — correct Supabase method for adding a phone
  // to an existing email-authenticated user. Sends SMS without touching
  // the current session.
  const sendOtp = useCallback(async () => {
    if (!phone) {
      toast.error('Phone number is required');
      return;
    }
    setIsSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ phone });
      if (error) throw error;

      setStep('sent');
      startCountdown();
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      toast.success('Verification code sent to your phone!');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send code';
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }, [phone, startCountdown]);

  const verifyOtp = useCallback(async () => {
    const token = digits.join('');
    if (token.length < OTP_LENGTH) {
      setError(name, {
        type: 'manual',
        message: 'Please enter the full 6-digit code',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const supabase = createClient();
      // type: 'phone_change' — used when confirming a phone number
      // added to an existing email-authenticated user (not a login).
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'phone_change',
      });
      if (error) throw error;

      // Notify parent to persist phone numbers to users table
      if (onVerified) await onVerified();

      clearErrors(name);
      setStep('verified');
      setValue(name, true, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(0);
      toast.success('Phone number verified successfully!');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Verification failed';
      setError(name, { type: 'manual', message });
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  }, [digits, phone, name, onVerified, setValue, setError, clearErrors]);

  // ─── Digit input handling ────────────────────────────────────────────
  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      // Accept only digits; handle paste of full code
      const cleaned = value.replace(/\D/g, '');

      if (cleaned.length > 1) {
        // Paste scenario: spread across boxes
        const next = [...digits];
        cleaned.split('').forEach((ch, i) => {
          if (index + i < OTP_LENGTH) next[index + i] = ch;
        });
        setDigits(next);
        const focusIndex = Math.min(index + cleaned.length, OTP_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();
        return;
      }

      const next = [...digits];
      next[index] = cleaned;
      setDigits(next);

      if (cleaned && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits]
  );

  const handleDigitKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const setInputRef = useCallback(
    (index: number, el: HTMLInputElement | null) => {
      inputRefs.current[index] = el;
    },
    []
  );

  return {
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
  };
};
