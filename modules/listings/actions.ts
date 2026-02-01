'use server'

import { errorHandler } from '@/utils/error-handler';
import { revalidatePath } from 'next/cache';
import { checkIsBookmarked, toggleBookmarkQuery } from './queries';

/**
 * Check if a listing is bookmarked by the current user
 * Server action wrapped with error handler
 */
export const checkIsBookmarkedAction = errorHandler(checkIsBookmarked);

/**
 * Toggle bookmark status for a listing
 * Server action wrapped with error handler
 */
export const toggleBookmarkAction = errorHandler(
    async (listingId: string, pathname?: string) => {
        const result = await toggleBookmarkQuery(listingId);

        if (pathname) {
            revalidatePath(pathname);
        }

        return result;
    }
);
