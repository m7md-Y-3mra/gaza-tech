import z, { ZodError, ZodType } from "zod";

export const zodValidation = <T>(schema: ZodType<T>, payload: T) => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
};

export const parseZodErrorClient = (error: string): string => {
  const zodError = JSON.parse(error) as ZodError['issues'];
  const fieldNames = [...new Set(zodError.map((e) => e.path.join(".")))];

  if (fieldNames.length === 0) {
    return "Validation failed. Please check your input.";
  }

  return `Please add missing ${fieldNames.join(", ")} query parameter${fieldNames.length > 1 ? 's' : ''} in url`;
}

export const parseZodErrorServer = (error: ZodError) => {
  return z.flattenError(error, (issue) => issue.message).fieldErrors;
}