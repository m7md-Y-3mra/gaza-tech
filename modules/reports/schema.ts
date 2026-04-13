import { z } from 'zod';
import { REPORT_REASONS } from './types';

export const createReportSchema = z
  .object({
    reason: z.enum(REPORT_REASONS),
    description: z.string().max(1000).optional(),
    reported_listing_id: z.string().uuid().optional(),
    reported_post_id: z.string().uuid().optional(),
    reported_comment_id: z.string().uuid().optional(),
    reported_user_id: z.string().uuid().optional(),
  })
  .refine(
    (data) =>
      [
        data.reported_listing_id,
        data.reported_post_id,
        data.reported_comment_id,
        data.reported_user_id,
      ].filter(Boolean).length === 1,
    { message: 'Exactly one reported content ID must be provided' }
  );

export type CreateReportInput = z.infer<typeof createReportSchema>;
