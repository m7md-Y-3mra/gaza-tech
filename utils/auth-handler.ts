import { createClient } from '@/lib/supabase/server';
import CustomError from './CustomError';

export const authHandler = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new CustomError({
      message: 'the user is not logged in',
    });
  }
  return user;
};
