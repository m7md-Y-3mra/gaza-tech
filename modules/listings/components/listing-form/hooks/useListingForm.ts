import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { createListingClientSchema } from '@/modules/listings/schema';
import {
    createListingAction,
    updateListingAction,
} from '@/modules/listings/actions';
import type { ListingFormMode } from '../types';
import type { z } from 'zod';
import { useRouter } from 'nextjs-toploader/app';
import {
    DEFAULT_CURRENCY,
    DEFAULT_PRODUCT_CONDITION,
} from '@/modules/listings/constant';
import { useImageUploader } from '../components/image-upload/hooks/useImageUploader';
import { toast } from 'sonner';

type ListingFormData = z.infer<typeof createListingClientSchema>;

export const useListingForm = (mode: ListingFormMode, listingId?: string) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const { uploadImages, deleteImages, isUploading, uploadError } =
        useImageUploader();

    const form = useForm<ListingFormData>({
        resolver: zodResolver(createListingClientSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            currency: DEFAULT_CURRENCY,
            category_id: '',
            product_condition: DEFAULT_PRODUCT_CONDITION,
            location_id: '',
            specifications: [],
            images: []
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: ListingFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);

        // Get images from form data
        let uploadedPaths: string[] = [];

        try {
            // Step 1: Upload images to storage (client-side)
            const uploadResults = await uploadImages(data.images);
            uploadedPaths = uploadResults.map((r) => r.path);


            // Step 2: Create/update listing with image data
            if (mode === 'create') {
                // Remove images from data before sending (already processed)
                const { images: _, ...listingData } = data;

                const result = await createListingAction({ ...listingData, images: uploadResults });

                if (!result.success) {
                    // Cleanup uploaded images on server error
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
                })
            } else if (mode === 'update' && listingId) {
                // Remove images from data before sending
                const { images: _, ...listingData } = data;

                const result = await updateListingAction(listingId, listingData);

                if (!result.success) {
                    // Cleanup uploaded images on server error
                    if (uploadedPaths.length > 0) {
                        await deleteImages(uploadedPaths);
                    }
                    setSubmitError(result.message || 'Failed to update listing');
                    return;
                }

                toast.success('Listing updated successfully');
                router.back();
            }
        } catch (error) {
            console.error('Form submission error:', error);

            // Cleanup uploaded images on any error
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
        isPending
    };
};

