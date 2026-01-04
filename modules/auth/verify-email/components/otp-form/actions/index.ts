'use server';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { errorHandler } from '@/utils/error-handler';
import CustomError from '@/utils/CustomError';
import { zodValidation } from '@/lib/zod-error';
import { createVerifyOtpSchema, resendOtpSchema } from '../otpForm.schema';
import { VerifyOtpSchemaType, ResendOtpSchemaType } from '../types';

export const verifyOtp = errorHandler(async (values: VerifyOtpSchemaType) => {
  const t = await getTranslations('Auth.verifyEmail.validation');
  const schema = createVerifyOtpSchema(t);
  const data = zodValidation(schema, values);
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: data.email,
    token: data.otp,
    type: 'signup',
  });

  if (error) {
    throw new CustomError({
      message: error.message,
      errors: { otp: error.message },
    });
  }

  return { verified: true };
});

export const resendOtp = errorHandler(async (values: ResendOtpSchemaType) => {
  const data = zodValidation(resendOtpSchema, values);
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: data.email,
  });

  if (error) {
    throw new CustomError({
      message: error.message,
      errors: { email: error.message },
    });
  }

  return { sent: true };
});
