import { z, ZodType } from 'zod';
import { SignupFormSchemaType } from './types';
import { TranslationFunction } from '@/types';

export const createSignupFormSchema = (t: TranslationFunction) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, { error: t('firstNameRequired') })
        .regex(/^[a-zA-Z\u0600-\u06FF ]+$/, {
          error: t('firstNameLettersOnly'),
        }),

      lastName: z
        .string({ error: t('lastNameRequired') })
        .min(1, { error: t('lastNameRequired') })
        .regex(/^[a-zA-Z\u0600-\u06FF ]+$/, {
          error: t('lastNameLettersOnly'),
        }),

      email: z.email({ error: t('emailInvalid') }),

      password: z
        .string()
        .min(8, { error: t('passwordMin') })
        .regex(/[A-Z]/, { error: t('passwordUppercase') })
        .regex(/[0-9]/, { error: t('passwordNumber') })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, {
          error: t('passwordSpecial'),
        }),

      confirmPassword: z
        .string()
        .min(1, { error: t('confirmPasswordRequired') }),

      terms: z.literal(true, {
        error: t('termsRequired'),
      }),

      newsletter: z.boolean().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: t('passwordsMismatch'),
      path: ['confirmPassword'],
    }) satisfies ZodType<SignupFormSchemaType>;
