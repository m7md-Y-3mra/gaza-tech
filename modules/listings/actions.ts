'use server';

import { errorHandler } from '@/utils/error-handler';
import { revalidatePath } from 'next/cache';
import {
  checkIsBookmarkedQuery,
  toggleBookmarkQuery,
  getListingDetailsQuery,
  getSimilarListingsQuery,
  getSellerListingsQuery,
  getCategoriesQuery,
  getLocationsQuery,
  createListingQuery,
  updateListingQuery,
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

/**
 * Get all active categories
 * Server action wrapped with error handler
 * Uses cache tag for revalidation
 */
export const getCategoriesAction = errorHandler(getCategoriesQuery);

/**
 * Get all active locations
 * Server action wrapped with error handler
 * Uses cache tag for revalidation
 */
export const getLocationsAction = errorHandler(getLocationsQuery);

/**
 * Create a new listing
 * Server action wrapped with error handler
 * Revalidates listings cache after creation
 */
export const createListingAction = errorHandler(
  async (
    listingData: Parameters<typeof createListingQuery>[0]
  ): Promise<ReturnType<typeof createListingQuery>> => {
    const result = await createListingQuery(listingData);

    // Revalidate listings-related paths
    revalidatePath('/listings');
    return result;
  }
);

/**
 * Update an existing listing
 * Server action wrapped with error handler
 * Revalidates specific listing and listings cache
 */
export const updateListingAction = errorHandler(
  async (
    listingId: string,
    listingData: Parameters<typeof updateListingQuery>[1]
  ): Promise<void> => {
    await updateListingQuery(listingId, listingData);

    // Revalidate specific listing and listings cache
    revalidatePath(`/listings/${listingId}`);
    revalidatePath('/listings');
  }
);
