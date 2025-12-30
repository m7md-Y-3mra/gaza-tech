import { ZodError } from 'zod';
import CustomError from './CustomError';
import { parseZodErrorServer } from '@/lib/zod-error';

type ApiResponseSuccess<T> = {
  success: true;
  data: T;
};

type ApiResponseError = {
  success: false;
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
      // Zod
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
      // Custom error fallback
      // ---------------------------
      if (err instanceof CustomError) {
        return {
          success: false,
          message: err.message,
          errors: err.errors,
        };
      }

      // ---------------------------
      // Unknown error fallback
      // ---------------------------

      console.error('Unexpected Server Action Error:', err);

      return {
        success: false,
        message: 'Unexpected Server Action Error',
      };
    }
  };
}
