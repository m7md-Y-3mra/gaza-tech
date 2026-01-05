'use server';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { LoginFormSchemaType } from '../types';
import { createLoginFormSchema } from '../LoginForm.schema';
import { errorHandler } from '@/utils/error-handler';
import CustomError from '@/utils/CustomError';
import { zodValidation } from '@/lib/zod-error';

export const signIn = errorHandler(async (values: LoginFormSchemaType) => {
  const t = await getTranslations('Auth.login.validation');
  const schema = createLoginFormSchema(t);
  const loginData = zodValidation(schema, values);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: loginData.email,
    password: loginData.password,
  });

  if (error) {
    throw new CustomError({
      message: error.message,
      errors: { email: error.message },
    });
  }

  return loginData;
});
