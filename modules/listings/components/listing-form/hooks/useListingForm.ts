import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useMemo } from 'react';
import {
    createListingClientSchema,
    updateListingClientSchema,
} from '@/modules/listings/schema';
import {
    createListingAction,
    updateListingAction,
} from '@/modules/listings/actions';
import type {
    CreateImageFile,
    ListingFormInitialData,
    ListingFormMode,
    UpdateImageFile,
} from '../types';
import type { z } from 'zod';
import { useRouter } from 'nextjs-toploader/app';
import {
    DEFAULT_CURRENCY,
    DEFAULT_PRODUCT_CONDITION,
} from '@/modules/listings/constant';
import { useImageUploader } from '../components/image-upload/hooks/useImageUploader';
import { toast } from 'sonner';
import { extractPathFromUrl } from '@/utils/supabase';

type CreateFormData = z.infer<typeof createListingClientSchema>;
type UpdateFormData = z.infer<typeof updateListingClientSchema>;
type ListingFormData = CreateFormData | UpdateFormData;

export const useListingForm = (
    mode: ListingFormMode,
    listingId?: string,
    initialData?: ListingFormInitialData
) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const { uploadImages, deleteImages, isUploading, uploadError } =
        useImageUploader();

    // Determine default values based on mode
    const defaultValues = initialData
        ? {
            title: initialData.title,
            description: initialData.description,
            price: initialData.price,
            currency: initialData.currency,
            category_id: initialData.category_id,
            product_condition: initialData.product_condition,
            location_id: initialData.location_id,
            specifications: initialData.specifications,
            images: initialData.images,
        }
        : {
            title: '',
            description: '',
            price: 0,
            currency: DEFAULT_CURRENCY,
            category_id: '',
            product_condition: DEFAULT_PRODUCT_CONDITION,
            location_id: '',
            specifications: [],
            images: [],
        };

    const form = useForm<ListingFormData>({
        resolver: zodResolver(
            mode === 'create' ? createListingClientSchema : updateListingClientSchema
        ),
        defaultValues,
        mode: 'onBlur',
    });

    // Track initial image URLs for detecting removed images in update mode
    const initialImageUrls = useMemo(() => {
        if (mode === 'update' && initialData?.images) {
            return initialData.images.map((img) => img.preview);
        }
        return [];
    }, [mode, initialData?.images]);

    const onSubmit = async (data: ListingFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);

        let uploadedPaths: string[] = [];

        try {
            if (mode === 'create') {
                // Create mode: upload all images
                const { images, ...listingData } = data as CreateFormData;
                const uploadResults = await uploadImages(images);
                uploadedPaths = uploadResults.map((r) => r.path);

                const result = await createListingAction({
                    ...listingData,
                    images: uploadResults,
                });

                if (!result.success) {
                    if (uploadedPaths.length > 0) {
                        await deleteImages(uploadedPaths);
                    }
                    setSubmitError(result.message || 'Failed to create listing');
                    return;
                }

                const successData = await result.data;
                toast.success('Listing created successfully');
                startTransition(() => {
                    router.push(`/listings/${successData.listingId}`);
                });
            } else if (mode === 'update' && listingId) {
                // Update mode: handle mixed existing and new images
                const { images: formImages, ...listingDataWithoutImages } = data;

                // Separate existing and new images
                const existingImages = formImages
                    .filter(
                        (img): img is UpdateImageFile =>
                            'isExisting' in img && img.isExisting === true
                    )
                    .filter(
                        (img): img is UpdateImageFile =>
                            'isExisting' in img && img.isExisting === true
                    );

                const newImages = formImages
                    .filter(
                        (img): img is CreateImageFile => 'file' in img
                    )
                    .filter(
                        (img): img is CreateImageFile => 'file' in img
                    );

                // Find images that were removed (in initial but not in final)
                const currentExistingUrls = new Set(
                    existingImages.map((img) => img.preview)
                );
                const removedImageUrls = initialImageUrls.filter(
                    (url) => !currentExistingUrls.has(url)
                );

                // Extract paths and delete removed images from storage
                const removedPaths = removedImageUrls
                    .map((url) => extractPathFromUrl(url))
                    .filter((path): path is string => path !== null);

                if (removedPaths.length > 0) {
                    try {
                        await deleteImages(removedPaths);
                    } catch (error) {
                        console.error('Failed to delete removed images:', error);
                        // Continue with update even if delete fails
                    }
                }

                // Upload new images
                let uploadResults: {
                    path: string;
                    url: string;
                    isThumbnail: boolean;
                }[] = [];
                if (newImages.length > 0) {
                    uploadResults = await uploadImages(newImages);
                    uploadedPaths = uploadResults.map((r) => r.path);
                }

                // Combine existing and new images for server
                const allImages = [
                    ...existingImages.map((img) => ({
                        url: img.preview,
                        isThumbnail: img.isThumbnail,
                        isExisting: true as const,
                    })),
                    ...uploadResults.map((img) => ({
                        path: img.path,
                        url: img.url,
                        isThumbnail: img.isThumbnail,
                        isExisting: false as const,
                    })),
                ];

                const result = await updateListingAction(listingId, {
                    ...listingDataWithoutImages,
                    images: allImages,
                });

                if (!result.success) {
                    if (uploadedPaths.length > 0) {
                        await deleteImages(uploadedPaths);
                    }
                    setSubmitError(result.message || 'Failed to update listing');
                    return;
                }

                toast.success('Listing updated successfully');
                startTransition(() => {
                    router.push(`/listings/${listingId}`);
                });
            }
        } catch (error) {
            console.error('Form submission error:', error);

            if (uploadedPaths.length > 0) {
                await deleteImages(uploadedPaths);
            }

            setSubmitError(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred. Please try again.'
            );

            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return {
        form,
        isSubmitting: isSubmitting || isUploading,
        submitError: submitError || uploadError,
        onSubmit: form.handleSubmit(onSubmit),
        handleCancel,
        isPending,
    };
};
