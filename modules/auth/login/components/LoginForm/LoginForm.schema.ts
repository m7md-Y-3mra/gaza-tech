import { z, ZodType } from 'zod';
import { LoginFormSchemaType } from './types';
import { TranslationFunction } from '@/types';

export const createLoginFormSchema = (t: TranslationFunction) =>
  z.object({
    email: z.email(t('emailInvalid')),
    password: z.string().min(8, t('passwordMin')),
    remember: z.boolean().optional(),
  }) satisfies ZodType<LoginFormSchemaType>;
