import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { createListingFormSchema } from '@/modules/listings/schema';
import { createListingAction, updateListingAction } from '@/modules/listings/actions';
import type { ListingFormMode } from '../types';
import type { z } from 'zod';
import { useRouter } from 'nextjs-toploader/app';
import { DEFAULT_CURRENCY, DEFAULT_PRODUCT_CONDITION } from '@/modules/listings/constant';

type ListingFormData = z.infer<typeof createListingFormSchema>;

export const useListingForm = (
    mode: ListingFormMode,
    listingId?: string,
) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<ListingFormData>({
        resolver: zodResolver(createListingFormSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            currency: DEFAULT_CURRENCY,
            category_id: '',
            product_condition: DEFAULT_PRODUCT_CONDITION,
            location_id: '',
            specifications: [],
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: ListingFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            if (mode === 'create') {
                // Create new listing
                const result = await createListingAction(data);

                if (!result.success) {
                    setSubmitError(result.message || 'Failed to create listing');
                    return;
                }

                const successData = await result.data;

                // Call success callback or redirect

                router.push(`/listings/${successData.listingId}`);

            } else if (mode === 'update' && listingId) {
                // Update existing listing
                const result = await updateListingAction(listingId, data);

                if (!result.success) {
                    setSubmitError(result.message || 'Failed to update listing');
                    return;
                }

                // Call success callback or redirect

                router.back();

            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    }

    return {
        form,
        isSubmitting,
        submitError,
        onSubmit: form.handleSubmit(onSubmit),
        handleCancel
    };
};
