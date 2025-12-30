"use server";
import { createClient } from "@/lib/supabase/server";
import { SignupFormSchemaType } from "../types";
import { signupFormSchema } from "../signupForm.schema";
import { errorHandler } from "@/utils/error-handler";
import CustomError from "@/utils/CustomError";
import { zodValidation } from "@/lib/zod-error";

export const signUp = errorHandler(async (values: SignupFormSchemaType) => {
  const userData = zodValidation(signupFormSchema, values);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  if (error) {
    throw new CustomError({
      message: "Sign up failed",
      errors: { email: error.message },
    });
  }

  //TODO: add rest values to user table

  return userData;
});
