import { z, ZodType } from 'zod';
import { Database } from '@/types/supabase';
import {
  Currency,
  CustomSpecificationType,
  ImageUploadResult,
  InsertListings,
  InsertListingsWithoutSellerId,
  PredefinedSpecificationType,
  ProductCondition,
  SpecificationEnum,
  specifications,
} from './types';
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from '@/constants/image-file';
import { CreateImageFile } from './components/listing-form/types';
import { TranslationFunction } from '@/types';

const specificationKeys = Object.keys(specifications) as SpecificationEnum[];

// ── Specification schemas (factory) ──────────────────────────────────

const createPredefinedSpecificationSchema = (t: TranslationFunction) =>
  z.object({
    label: z.enum(specificationKeys),
    value: z
      .string({ message: t('specValueRequired') })
      .min(1, t('specValueRequired')),
    isCustom: z.literal(false),
  }) satisfies ZodType<PredefinedSpecificationType>;

const createCustomSpecificationSchema = (t: TranslationFunction) =>
  z.object({
    label: z
      .string({ message: t('specLabelRequired') })
      .min(1, t('specLabelRequired')),
    value: z
      .string({ message: t('specValueRequired') })
      .min(1, t('specValueRequired')),
    isCustom: z.literal(true),
  }) satisfies ZodType<CustomSpecificationType>;

const createSpecificationSchema = (t: TranslationFunction) =>
  z.discriminatedUnion('isCustom', [
    createPredefinedSpecificationSchema(t),
    createCustomSpecificationSchema(t),
  ]);

// ── Image file schema (factory) ──────────────────────────────────────

const createImageFileSchema = (t: TranslationFunction) =>
  z
    .file()
    .min(10_000, t('imageMinSize'))
    .max(MAX_UPLOAD_SIZE, t('imageMaxSize'))
    .mime(ACCEPTED_FILE_TYPES, t('imageInvalidType'));

// ── Base listing schema (factory) ────────────────────────────────────

const createBaseListingSchema = (t: TranslationFunction) =>
  z.object({
    listing_id: z.uuid(),

    title: z
      .string({ message: t('titleRequired') })
      .min(10, t('titleMin'))
      .max(100, t('titleMax')),

    description: z
      .string({ message: t('descriptionRequired') })
      .min(20, t('descriptionMin'))
      .max(2000, t('descriptionMax')),

    price: z
      .number({ message: t('priceRequired') })
      .min(1, t('priceMin')),

    currency: z.enum(Object.keys(Currency)).nullable(),

    category_id: z.uuid({ message: t('categoryRequired') }),

    product_condition: z.enum(Object.keys(ProductCondition), { message: t('productConditionRequired') }),

    location_id: z.uuid({ message: t('locationRequired') }),

    seller_id: z.uuid({ message: t('sellerIdRequired') }),

    specifications: z
      .array(createSpecificationSchema(t))
      .min(specificationKeys.length, { message: t('specificationsRequired') }),

    content_status: z.string().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  }) satisfies ZodType<
    Database['public']['Tables']['marketplace_listings']['Row']
  >;

// ── Insert schema (factory) ──────────────────────────────────────────

const createInsertListingSchema = (t: TranslationFunction) =>
  createBaseListingSchema(t).omit({
    listing_id: true,
    created_at: true,
    updated_at: true,
    content_status: true,
  }) satisfies ZodType<InsertListings>;

// ── Client schemas (factories — used with useTranslations) ───────────

const createListingImageSchema = (t: TranslationFunction) =>
  z.object({
    file: createImageFileSchema(t),
    isThumbnail: z.boolean(),
    isExisting: z.literal(false).optional(),
    preview: z.string(),
  });

const updateListingImageSchema = z.object({
  preview: z.string(),
  isThumbnail: z.boolean(),
  isExisting: z.literal(true),
});

export const createCreateListingClientSchema = (t: TranslationFunction) =>
  createInsertListingSchema(t)
    .omit({ seller_id: true })
    .extend({
      images: z
        .array(createListingImageSchema(t))
        .min(1, { message: t('imagesRequired') }),
    }) satisfies ZodType<
      InsertListingsWithoutSellerId & { images: CreateImageFile[] }
    >;

export const createUpdateListingClientSchema = (t: TranslationFunction) =>
  createCreateListingClientSchema(t)
    .partial()
    .extend({
      images: z
        .array(
          z.union([createListingImageSchema(t), updateListingImageSchema]),
          { message: t('imagesRequired') }
        )
        .min(1, { message: t('imagesRequired') }),
    });

// ── Static exports (for type inference & server schemas) ─────────────

const defaultT: TranslationFunction = (key: string) => key;

export const createListingClientSchema = createCreateListingClientSchema(defaultT);
export const updateListingClientSchema = createUpdateListingClientSchema(defaultT);

export const ListingSchema = createBaseListingSchema(defaultT);
export const SpecificationSchema = createSpecificationSchema(defaultT);
export const createListingSchema = createInsertListingSchema(defaultT);

// ── Server schemas (no translation needed) ───────────────────────────

export const createListingServerSchema = createListingSchema.extend({
  images: z
    .array(
      z.object({
        path: z.string(),
        url: z.string(),
        isThumbnail: z.boolean(),
      }),
      { message: 'Images are required' }
    )
    .min(1, { message: 'Please upload at least one image' }),
}) satisfies ZodType<InsertListings & { images: ImageUploadResult[] }>;

export const updateListingServerSchema = createListingSchema
  .partial()
  .omit({ seller_id: true })
  .extend({
    images: z
      .array(
        z.object({
          path: z.string().optional(),
          url: z.string(),
          isThumbnail: z.boolean(),
          isExisting: z.boolean().optional(),
        }),
        { message: 'Images are required' }
      )
      .min(1, { message: 'Please upload at least one image' }),
  });
