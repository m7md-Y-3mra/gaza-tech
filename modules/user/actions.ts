'use server';

import { errorHandler } from '@/utils/error-handler';
import {
  getUserById,
  getUserListingsQuery,
  getBookmarkedListingsQuery,
} from './queries';

/**
 * Get user profile by ID
 * Server action wrapped with error handler
 */
export const getUserProfileAction = errorHandler(getUserById);

/**
 * Get paginated listings for a user
 * Server action wrapped with error handler
 */
export const getUserListingsAction = errorHandler(getUserListingsQuery);

/**
 * Get paginated bookmarked listings for the current user
 * Server action wrapped with error handler
 */
export const getBookmarkedListingsAction = errorHandler(
  getBookmarkedListingsQuery
);
