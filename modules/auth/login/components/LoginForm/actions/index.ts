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
  const tAuth = await getTranslations('Auth.login.toast');
  const schema = createLoginFormSchema(t);
  const loginData = zodValidation(schema, values);

  const supabase = await createClient();
  const {
    data: { user },
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email: loginData.email,
    password: loginData.password,
  });

  if (signInError || !user) {
    throw new CustomError({
      message: signInError?.message || 'Authentication failed',
      errors: { email: signInError?.message || 'Authentication failed' },
    });
  }

  // Fresh check for ban status in the public.users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_active')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    // Immediate sign out to clean up the newly created session
    await supabase.auth.signOut();

    throw new CustomError({
      message: tAuth('banned'),
      errors: { email: tAuth('banned') },
    });
  }

  return loginData;
});
