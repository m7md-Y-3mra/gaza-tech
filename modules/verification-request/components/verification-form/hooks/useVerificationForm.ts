import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'nextjs-toploader/app';
import {
    verificationRequestClientSchema,
    type VerificationRequestClientValues,
} from '../../../schema';
import { useVerificationFormClient } from '../types';
import { updateUserPhoneAction, createVerificationRequestAction } from '../../../actions';
import { useImageUploader } from '@/modules/verification-request/components/upload-image/hooks/useImageUploader'; // Import our new hook
import { excludeObj } from '@/utils/object.utils';
import { BUCKET_NAME } from '../constant';

export const useVerificationForm = ({ isPhoneVerified, existingPhone }: useVerificationFormClient) => {
    const router = useRouter();
    const { uploadFiles, isUploading, deleteFiles } = useImageUploader();

    const methods = useForm<VerificationRequestClientValues>({
        resolver: zodResolver(verificationRequestClientSchema),
        defaultValues: {
            id_gender: null,
            phone_verified: isPhoneVerified || undefined,
            phone_number: existingPhone ?? '',
            whatsapp_number: undefined,
            terms_accepted: false,
        },
        mode: 'onTouched',
    });

    const { handleSubmit, formState: { isSubmitting }, watch, getValues } = methods;

    const livePhone = watch('phone_number');

    const handleVerified = useCallback(async () => {
        const { phone_number, whatsapp_number } = getValues();
        const result = await updateUserPhoneAction({ phone_number, whatsapp_number });
        if (!result.success) {
            toast.error(result.message ?? 'Failed to save phone number');
            throw new Error(result.message);
        }
    }, [getValues]);

    const onSubmit = async (data: VerificationRequestClientValues) => {
        try {
            // 1. Prepare files for upload
            const filesToUpload = [
                data.document_front,
                data.document_back,
                data.selfie_with_id,
            ];

            // 2. Upload to a verification-specific bucket
            // Note: Make sure "verification-documents" bucket is created in Supabase!
            const uploadedImages = await uploadFiles(
                filesToUpload,
                BUCKET_NAME,
                'documents'
            );

            // 3. Construct server payload matching `verificationRequestServerSchema`
            const payload = {
                ...data,
                document_front_url: uploadedImages[0].url,
                document_back_url: uploadedImages[1].url,
                selfie_with_id_url: uploadedImages[2].url,
            };

            // Remove UI-specific / Client-specific fields before sending
            const serverPayload = excludeObj(payload, ['document_front', 'document_back', 'selfie_with_id', 'phone_number', 'whatsapp_number', 'terms_accepted'])

            // 4. Submit to Database
            const result = await createVerificationRequestAction(serverPayload);
            if (!result.success) {
                const uploadedPaths = uploadedImages.map((r) => r.path);
                if (uploadedImages.length > 0) {
                    await deleteFiles(BUCKET_NAME, uploadedPaths);
                }
                toast.error(result.message || 'Failed to submit request');
                return;
            }

            toast.success('Verification request submitted successfully!');
            router.push('/profile'); // Or wherever you want to redirect them
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred during submission.');
        }
    };

    return {
        methods,
        handleSubmit,
        isSubmitting: isSubmitting || isUploading, // Lock form during uploads
        livePhone,
        handleVerified,
        onSubmit,
    };
};