'use server';

import { signOutQuery } from './queries';

/**
 * Sign out server action
 * Calls signOutQuery then redirects to login page
 */
export async function signOutAction() {
    await signOutQuery();
}
