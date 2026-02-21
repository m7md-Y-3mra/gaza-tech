'use server';

import { createClient } from '@/lib/supabase/server';
import { authHandler } from '@/utils/auth-handler';
import CustomError from '@/utils/CustomError';

/**
 * Updates users.phone_number and users.whatsapp_number for the
 * currently-authenticated user.
 *
 * Called after supabase.auth.verifyOtp({ type: 'phone_change' }) succeeds
 * on the client — at that point the phone is already linked to the auth user,
 * so we just persist the numbers to our public users table.
 */
export async function updateUserPhoneNumbers({
    phone_number,
    whatsapp_number,
}: {
    phone_number: string;
    whatsapp_number?: string;
}): Promise<void> {
    const supabase = await createClient();

    const user = await authHandler();

    const { error } = await supabase
        .from('users')
        .update({
            phone_number,
            whatsapp_number: whatsapp_number || null,
        })
        .eq('user_id', user.id);

    if (error) {
        throw new CustomError(
            { message: error.message || 'Failed to update phone number' }
        );
    }
}
