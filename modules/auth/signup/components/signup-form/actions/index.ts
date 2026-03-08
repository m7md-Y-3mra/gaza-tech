'use server';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { SignupFormSchemaType } from '../types';
import { createSignupFormSchema } from '../signupForm.schema';
import { errorHandler } from '@/utils/error-handler';
import CustomError from '@/utils/CustomError';
import { zodValidation } from '@/lib/zod-error';

export const signUp = errorHandler(async (values: SignupFormSchemaType) => {
  const t = await getTranslations('Auth.signup.validation');
  const schema = createSignupFormSchema(t);
  const userData = zodValidation(schema, values);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  if (error) {
    throw new CustomError({
      message: 'Sign up failed',
      errors: { email: error.message },
    });
  }

  //TODO: add rest values to user table

  return userData;
});
