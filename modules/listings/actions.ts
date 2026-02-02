'use server';

import { errorHandler } from '@/utils/error-handler';
import { revalidatePath } from 'next/cache';
import {
  checkIsBookmarkedQuery,
  toggleBookmarkQuery,
  getListingDetailsQuery,
  getSimilarListingsQuery,
  getSellerListingsQuery,
} from './queries';

/**
 * Get listing details
 * Server action wrapped with error handler
 */
export const getListingDetailsAction = errorHandler(getListingDetailsQuery);

/**
 * Get similar listings
 * Server action wrapped with error handler
 */
export const getSimilarListingsAction = errorHandler(getSimilarListingsQuery);

/**
 * Get seller listings
 * Server action wrapped with error handler
 */
export const getSellerListingsAction = errorHandler(getSellerListingsQuery);

/**
 * Check if a listing is bookmarked by the current user
 * Server action wrapped with error handler
 */
export const checkIsBookmarkedAction = errorHandler(checkIsBookmarkedQuery);

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
