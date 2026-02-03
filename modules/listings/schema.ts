import { z, ZodType } from 'zod';
import { Database } from '@/types/supabase';
import { Currency, ProductCondition, specifications } from './types';

const PredefinedSpecificationSchema = z.object({
    label: z.enum(Object.values(specifications), { message: 'Please select a valid specification type' }),
    value: z.string({ message: 'Specification value is required' }),
    isCustom: z.literal(false),
});

const CustomSpecificationSchema = z.object({
    label: z.string({ message: 'Specification label is required' }).min(1, 'Specification label cannot be empty'),
    value: z.string({ message: 'Specification value is required' }),
    isCustom: z.literal(true),
});

export const SpecificationSchema = z.discriminatedUnion("isCustom", [
    PredefinedSpecificationSchema,
    CustomSpecificationSchema,
]);

export const ListingSchema =
    z.object({
        listing_id: z.uuid(),

        title: z
            .string({ message: 'Title is required' })
            .min(10, 'Title must be at least 10 characters long')
            .max(100, 'Title cannot exceed 100 characters'),

        description: z
            .string({ message: 'Description is required' })
            .min(50, 'Description must be at least 50 characters long')
            .max(2000, 'Description cannot exceed 2000 characters'),

        price: z
            .number({ message: 'Price must be a valid number' })
            .min(0, 'Price cannot be negative'),

        currency: z.enum(Object.values(Currency)).nullable(),

        category_id: z
            .uuid({ message: 'Please select a valid category' }),

        product_condition: z.enum(Object.values(ProductCondition)),

        location_id: z
            .uuid({ message: 'Please select a valid location' }),

        seller_id: z.uuid({ message: 'Seller ID must be valid' }),

        specifications: z.array(SpecificationSchema),

        content_status: z.string().nullable(),

        created_at: z.string().nullable(),

        updated_at: z.string().nullable(),
    }) satisfies ZodType<Database['public']['Tables']['marketplace_listings']['Row']>;

export const createListingSchema = ListingSchema
    .omit({
        listing_id: true,
        created_at: true,
        updated_at: true,
        content_status: true,
    }) satisfies ZodType<Database['public']['Tables']['marketplace_listings']['Insert']>;

export const createListingFormSchema = createListingSchema
    .omit({
        seller_id: true
    }) satisfies ZodType<Omit<Database['public']['Tables']['marketplace_listings']['Insert'], 'seller_id'>>;
