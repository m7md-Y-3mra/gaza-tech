'use client';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import { SignupFormSchemaType } from '../types';
import { signupFormSchema } from '../signupForm.schema';
import { signUp } from '../actions';

export const useSignupForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignupFormSchemaType>({
    resolver: zodResolver(signupFormSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true,
      newsletter: false,
    },
  });

  const onSubmit = async (values: SignupFormSchemaType) => {
    setServerError(null);

    const result = await signUp(values);

    if (!result.success) {
      if (result.errors && Object.keys(result.errors).length > 0) {
        Object.entries(result.errors).forEach(([field, message]) => {
          form.setError(field as keyof SignupFormSchemaType, { message: message[0] });
        });
      }
      setServerError(result.message);
      toast.error(result.message);
      return;
    }

    toast.success("Account created successfully! Please verify your email.");
    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  };

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    serverError,
    passwordsMatch,
  };
}
