import z, { ZodError } from "zod";

type ApiResponseSuccess<T> = {
  success: true,
  data: T,
}

type ApiResponseError = {
  success: false,
  errors: Record<string, string> | string
}

export function errorHandler<Args extends unknown[], Return>(
  actionFn: (...args: Args) => Promise<Return>,
) {
  return async (...args: Args): Promise<ApiResponseSuccess<Return> | ApiResponseError> => {
    try {
      const data = await actionFn(...args);

      return {
        success: true,
        data,
      } as ApiResponseSuccess<Return>;
    } catch (err: unknown) {
      // ---------------------------
      // Zod
      // ---------------------------

      if (err instanceof ZodError) {
        const errors = z.flattenError(err, (issue) => issue.message).fieldErrors;

        return {
          success: false,
          errors,
        };
      }

      // ---------------------------
      // Unknown error fallback
      // ---------------------------

      console.error("Unexpected Server Action Error:", err);

      return {
        success: false,
        errors: "Unexpected Server Action Error"
      };
    }
  };
}
