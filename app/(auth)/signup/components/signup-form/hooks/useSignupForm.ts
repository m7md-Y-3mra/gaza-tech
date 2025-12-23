'use client';
import { useState } from 'react';
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { SignupFormSchemaType } from '../types';
import { signupFormSchema } from '../signupForm.schema';

export const useSignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik<SignupFormSchemaType>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true,
      newsletter: false,
    },
    validationSchema: toFormikValidationSchema(signupFormSchema),
    onSubmit: async (values) => {


      setIsSubmitting(true);
      setServerError(null);

      try {
        console.log("success")
      } catch {
        setServerError("error");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const passwordsMatch =
    formik.values.confirmPassword.length > 0 &&
    formik.values.password === formik.values.confirmPassword;

  return {
    formik,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSubmitting,
    serverError,
    passwordsMatch,
  };

}