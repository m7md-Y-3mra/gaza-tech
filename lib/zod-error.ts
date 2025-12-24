import { ZodError } from "zod";

export function parseZodErrorClient(error: string): string {
  const zodError = JSON.parse(error) as ZodError['issues'];
  const fieldNames = [...new Set(zodError.map((e) => e.path.join(".")))];

  if (fieldNames.length === 0) {
    return "Validation failed. Please check your input.";
  }

  return `Please add missing ${fieldNames.join(", ")} query parameter${fieldNames.length > 1 ? 's' : ''} in url`;
}
