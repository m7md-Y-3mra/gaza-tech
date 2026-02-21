'use server';

import { errorHandler } from '@/utils/error-handler';
import { updateUserPhoneNumbers } from './queries';

/**
 * Server action — called by OtpVerify's onVerified callback AFTER
 * supabase.auth.verifyOtp({ type: 'phone_change' }) has already succeeded.
 *
 * Full phone verification flow:
 *  1. User (signed in with email) enters phone + whatsapp in the form.
 *  2. "Send Code" → supabase.auth.updateUser({ phone })   [client hook]
 *     Supabase sends an SMS. Existing email session is preserved.
 *  3. User enters the 6-digit code.
 *  4. "Verify Code" → supabase.auth.verifyOtp({ phone, token, type: 'phone_change' })  [client hook]
 *     Supabase links the phone to the current auth user (no logout).
 *  5. onVerified fires → this action updates users.phone_number + users.whatsapp_number.
 *  6. Form field phone_verified is set to true.
 */
export const updateUserPhoneAction = errorHandler(
    updateUserPhoneNumbers
);
