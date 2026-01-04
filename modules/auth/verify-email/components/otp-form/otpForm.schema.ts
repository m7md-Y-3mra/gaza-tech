import { z, ZodType } from 'zod';
import {
  OtpFormSchemaType,
  ResendOtpSchemaType,
  VerifyOtpSchemaType,
} from './types';
import { TranslationFunction } from '@/types';

export const createVerifyOtpSchema = (t: TranslationFunction) =>
  z.object({
    email: z.email(),
    otp: z
      .string()
      .min(6, { message: t('otpRequired') })
      .max(6, { message: t('otpLength') })
      .regex(/^\d{6}$/, { message: t('otpNumbersOnly') }),
  }) satisfies ZodType<VerifyOtpSchemaType>;

export const createOtpFormSchema = (t: TranslationFunction) =>
  createVerifyOtpSchema(t).pick({
    otp: true,
  }) satisfies ZodType<OtpFormSchemaType>;

export const resendOtpSchema = z.object({
  email: z.email(),
}) satisfies ZodType<ResendOtpSchemaType>;
