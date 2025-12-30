"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { LoginFormSchemaType } from "../types";
import { loginFormSchema } from "../LoginForm.schema";
import { signIn } from "../actions";

export const useLoginForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormSchemaType>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values: LoginFormSchemaType) => {
    setServerError(null);

    const result = await signIn(values);

    if (!result.success) {
      setServerError(result.message);
      toast.error(result.message);
      return;
    }

    toast.success("Signed in successfully!");
    router.push("/");
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    serverError,
  };
};
