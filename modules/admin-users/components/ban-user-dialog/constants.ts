import { z } from 'zod';

export const BAN_REASON_MAX = 500;

export const BanReasonFormSchema = z.object({
  reason: z.string().trim().min(1).max(BAN_REASON_MAX),
});

export type BanReasonFormValues = z.infer<typeof BanReasonFormSchema>;
