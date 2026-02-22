'use server';

import { createClient } from '@/lib/supabase/server';
import { authHandler } from '@/utils/auth-handler';
import CustomError from '@/utils/CustomError';
import { zodValidation } from '@/lib/zod-error';
import { verificationRequestServerSchema } from './schema';
import { z } from 'zod';

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
    throw new CustomError({
      message: error.message || 'Failed to update phone number',
    });
  }
}

export async function createVerificationRequestQuery(
  requestData: Omit<z.infer<typeof verificationRequestServerSchema>, 'user_id'>
) {
  const supabase = await createClient();
  const user = await authHandler();

  // Validate the data coming from the client against the server schema
  const validatedData = zodValidation(
    verificationRequestServerSchema,
    requestData
  );

  const { data, error } = await supabase
    .from('verification_requests')
    .insert({
      ...validatedData,
      verification_status: 'pending', // Default status upon creation
      user_id: user.id,
    })
    .select('verification_request_id')
    .single();

  if (error) {
    console.error('Error creating verification request:', error);
    throw new CustomError({
      message: error.message || 'Failed to submit verification request',
    });
  }

  return data;
}
