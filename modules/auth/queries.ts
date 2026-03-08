import { createClient } from '@/lib/supabase/server';

/**
 * Sign out the current user
 * Single purpose: Call Supabase signOut
 */
export async function signOutQuery() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }

  return { success: true };
}
