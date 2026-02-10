import { z, ZodType } from 'zod';
import { Database } from '@/types/supabase';
import { Currency, ImageUploadResult, InsertListings, InsertListingsWithoutSellerId, ProductCondition, specifications } from './types';
import { imageFileSchema } from '@/schemas/image-file';
import { CreateImageFile } from './components/listing-form/types';

const PredefinedSpecificationSchema = z.object({
    label: z.enum(Object.keys(specifications), { message: 'Please select a valid specification type' }),
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
            .min(20, 'Description must be at least 20 characters long')
            .max(2000, 'Description cannot exceed 2000 characters'),

        price: z
            .number({ message: 'Price must be a valid number' })
            .min(1, 'Price cannot be zero or negative'),

        currency: z.enum(Object.keys(Currency)).nullable(),

        category_id: z
            .uuid({ message: 'Please select a valid category' }),

        product_condition: z.enum(Object.keys(ProductCondition)),

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
    }) satisfies ZodType<InsertListings>;

const createListingImageSchema = z.object({
    file: imageFileSchema,
    isThumbnail: z.boolean(),
    isExisting: z.literal(false).optional(),
});

const updateListingImageSchema = z.object({
    preview: z.string(),
    isThumbnail: z.boolean(),
    isExisting: z.literal(true),
});

export const createListingClientSchema = createListingSchema
    .omit({
        seller_id: true
    }).extend({
        images: z.array(createListingImageSchema).min(1, { message: "Please upload at least one image" })
    }) satisfies ZodType<InsertListingsWithoutSellerId & { images: CreateImageFile[] }>

export const createListingServerSchema = createListingSchema.extend({
    images: z.array(z.object({
        path: z.string(),
        url: z.string(),
        isThumbnail: z.boolean(),
    }), { message: "Images are required" }).min(1, { message: "Please upload at least one image" })
}) satisfies ZodType<InsertListings & { images: ImageUploadResult[] }>;

// Update listing schemas - allows partial updates
export const updateListingClientSchema = createListingClientSchema.partial().extend({
    // Images can be a mix of existing URLs and new uploads
    images: z.array(z.union([
        // New upload (has File)
        createListingImageSchema,
        // Existing image (has url string)
        updateListingImageSchema
    ]), { message: "Images are required" }).min(1, { message: "Please upload at least one image" })
});

export const updateListingServerSchema = createListingSchema.partial().omit({
    seller_id: true,
}).extend({
    images: z.array(z.object({
        path: z.string().optional(),
        url: z.string(),
        isThumbnail: z.boolean(),
        isExisting: z.boolean().optional(),
    }), { message: "Images are required" }).min(1, { message: "Please upload at least one image" })
});