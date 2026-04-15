import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  name_ar: z.string().trim().min(1, 'Arabic name is required').max(100),
  description: z.string().trim().max(500).optional(),
  icon_url: z.url('Invalid URL format').optional().or(z.literal('')),
  parent_id: z.uuid().optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  name_ar: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  icon_url: z.url('Invalid URL format').optional().or(z.literal('')),
  parent_id: z.uuid().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const CreateLocationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  name_ar: z.string().trim().min(1, 'Arabic name is required').max(100),
  sort_order: z.number().int().min(0).optional(),
});

export const UpdateLocationSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  name_ar: z.string().trim().min(1).max(100).optional(),
  sort_order: z.number().int().min(0).optional().nullable(),
  is_active: z.boolean().optional(),
});

export type CreateCategoryFormValues = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryFormValues = z.infer<typeof UpdateCategorySchema>;
export type CreateLocationFormValues = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationFormValues = z.infer<typeof UpdateLocationSchema>;
