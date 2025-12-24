'use client';
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { OtpFormSchemaType, OtpFormProps } from "../types";
import { otpFormSchema } from "../otpForm.schema";
import { TOTAL_SECONDS, RESEND_COOLDOWN } from "../otpForm.constant";
import { verifyOtp, resendOtp } from "../actions";

export const useOtpForm = ({
  email,
  onSuccess,
  onError,
  onResendSuccess,
}: OtpFormProps) => {
  const router = useRouter();
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

    const result = await resendOtp({ email });

    if (!result.success) {
      setServerError(result.message);
      toast.error(result.message);
      onError?.(result.message);
      setIsResending(false);
      return;
    }

    setResendCooldown(RESEND_COOLDOWN);
    setRemainingSeconds(TOTAL_SECONDS);
    setIsExpired(false);
    setResendSuccess(true);
    toast.success("Verification code sent!");
    onResendSuccess?.();

    // Hide success message after 5 seconds
    setTimeout(() => setResendSuccess(false), 5000);
    setIsResending(false);
  };

  const onSubmit = async (values: OtpFormSchemaType) => {
    setServerError(null);

    const result = await verifyOtp({ email, otp: values.otp });

    if (!result.success) {
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, message]) => {
          form.setError(field as keyof OtpFormSchemaType, { message: message[0] });
        });
      }
      setServerError(result.message);
      toast.error(result.message);
      onError?.(result.message);
      return;
    }

    toast.success("Email verified successfully!");
    onSuccess?.();
    router.push("/login");
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
