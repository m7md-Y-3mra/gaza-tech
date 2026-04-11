import { ZodError } from 'zod';
import CustomError from './CustomError';
import { parseZodErrorServer } from '@/lib/zod-error';
import { PostgrestError } from '@supabase/supabase-js';

export type ApiResponseSuccess<T> = {
  success: true;
  data: T;
};

export type ApiResponseError = {
  success: false;
  code?: string;
  message: string;
  errors?: Record<string, string>;
};

export function errorHandler<Args extends unknown[], Return>(
  actionFn: (...args: Args) => Promise<Return>
) {
  return async (
    ...args: Args
  ): Promise<ApiResponseSuccess<Return> | ApiResponseError> => {
    try {
      const data = await actionFn(...args);

      return {
        success: true,
        data,
      };
    } catch (err: unknown) {
      // ---------------------------
      // Zod Validation Errors
      // ---------------------------

      if (err instanceof ZodError) {
        const errors = parseZodErrorServer(err);

        return {
          success: false,
          message: 'Validation error',
          errors,
        };
      }

      // ---------------------------
      // Custom Error
      // ---------------------------
      if (err instanceof CustomError) {
        return {
          success: false,
          code: err.code,
          message: err.message,
          errors: err.errors,
        };
      }

      // ---------------------------
      // Supabase PostgrestError
      // ---------------------------
      if (isPostgrestError(err)) {
        return handlePostgrestError(err);
      }

      // ---------------------------
      // Unknown Error Fallback
      // ---------------------------

      console.error('Unexpected Server Action Error:', err);

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  };
}

/**
 * Type guard to check if error is a PostgrestError
 */
function isPostgrestError(err: unknown): err is PostgrestError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err &&
    'details' in err
  );
}

/**
 * Handle Supabase PostgrestError with specific error codes
 */
function handlePostgrestError(err: PostgrestError): ApiResponseError {
  const { code, message, details, hint } = err;

  // Common Supabase error codes
  switch (code) {
    // No rows found - not necessarily an error
    case 'PGRST116':
      return {
        success: false,
        message: 'No data found',
      };

    // Unique constraint violation
    case '23505':
      return {
        success: false,
        message: 'This record already exists',
      };

    // Foreign key violation
    case '23503':
      return {
        success: false,
        message: 'Related record not found',
      };

    // Not null violation
    case '23502':
      return {
        success: false,
        message: 'Required field is missing',
      };

    // Check constraint violation
    case '23514':
      return {
        success: false,
        message: 'Invalid data provided',
      };

    // Insufficient privilege
    case '42501':
      return {
        success: false,
        message: 'You do not have permission to perform this action',
      };

    // Row level security policy violation
    case 'PGRST301':
      return {
        success: false,
        message: 'Access denied',
      };

    // JWT expired
    case 'PGRST301':
      return {
        success: false,
        message: 'Your session has expired. Please log in again.',
      };

    // Invalid JWT
    case 'PGRST302':
      return {
        success: false,
        message: 'Invalid authentication. Please log in again.',
      };

    // Default case for other Supabase errors
    default:
      console.error('Supabase Error:', { code, message, details, hint });
      return {
        success: false,
        message: message || 'A database error occurred',
      };
  }
}
