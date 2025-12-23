'use client';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupFormSchemaType } from '../types';
import { signupFormSchema } from '../signupForm.schema';

export const useSignupForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);

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

    try {
      console.log("success", values);
    } catch {
      setServerError("error");
    }
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
