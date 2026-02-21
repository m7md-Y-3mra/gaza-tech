import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    verificationRequestClientSchema,
    type VerificationRequestClientValues,
} from '../../../schema';
import { useVerificationFormClient } from '../types';
import { toast } from 'sonner';
import { updateUserPhoneAction } from '../../../actions';

export const useVerificationForm = ({ isPhoneVerified, existingPhone }: useVerificationFormClient) => {
    const methods = useForm<VerificationRequestClientValues>({
        resolver: zodResolver(verificationRequestClientSchema),
        defaultValues: {
            id_gender: null,
            // If phone is already verified via auth, pre-set the field to true
            // so Zod validation passes without requiring the OTP section.
            phone_verified: isPhoneVerified || undefined,
            phone_number: existingPhone ?? '',
            whatsapp_number: '',
            terms_accepted: false,
        },
        mode: 'onTouched',
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
        watch,
        getValues,
    } = methods;

    // Watch phone_number live to pass to OtpVerify
    const livePhone = watch('phone_number');

    /**
     * Called by OtpVerify AFTER supabase.auth.verifyOtp({ type: 'phone_change' }) succeeds.
     * Persists phone_number + whatsapp_number to the users table via server action.
     */
    const handleVerified = useCallback(async () => {
        const { phone_number, whatsapp_number } = getValues();

        const result = await updateUserPhoneAction({
            phone_number,
            whatsapp_number,
        });

        if (!result.success) {
            toast.error(result.message ?? 'Failed to save phone number');
            throw new Error(result.message); // stops OtpVerify from flipping to 'verified'
        }
    }, [getValues]);

    const onSubmit = async (data: VerificationRequestClientValues) => {
        // TODO: upload images to storage then call server action
        console.log('Submit verification request:', data);
    };

    return {
        methods,
        handleSubmit,
        isSubmitting,
        livePhone,
        handleVerified,
        onSubmit,
    }
}