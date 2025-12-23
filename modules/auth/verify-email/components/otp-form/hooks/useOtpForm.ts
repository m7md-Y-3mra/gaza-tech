'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpFormSchemaType, OtpFormProps } from "../types";
import { otpFormSchema } from "../otpForm.schema";
import { TOTAL_SECONDS, RESEND_COOLDOWN } from "../otpForm.constant";

export const useOtpForm = ({
  email,
  onSuccess,
  onError,
  onResendSuccess,
}: OtpFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const form = useForm<OtpFormSchemaType>({
    resolver: zodResolver(otpFormSchema),
    mode: "onTouched",
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer effect
  useEffect(() => {
    if (remainingSeconds <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // Resend cooldown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setServerError(null);
    setResendSuccess(false);

    try {
      // TODO: Implement resendOtp API call
      // await resendOtp(email);
      setResendCooldown(RESEND_COOLDOWN);
      setRemainingSeconds(TOTAL_SECONDS);
      setIsExpired(false);
      setResendSuccess(true);
      onResendSuccess?.();

      // Hide success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to resend code";
      setServerError(message);
      onError?.(message);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (values: OtpFormSchemaType) => {
    setServerError(null);

    try {
      // TODO: Implement verifyOtp API call
      // await verifyOtp(email, values.otp);
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Verification failed";
      setServerError(message);
      onError?.(message);
    }
  };

  const otp = form.watch("otp");

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    serverError,
    remainingSeconds,
    resendCooldown,
    isResending,
    resendSuccess,
    isExpired,
    handleResend,
    otp,
  };
};
