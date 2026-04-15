'use server';

import { errorHandler } from '@/utils/error-handler';
import { createReportQuery } from './queries';
import { createReportSchema, CreateReportInput } from './schema';

/**
 * Server action to submit a new report.
 * Validates input with Zod and wraps the query with errorHandler.
 */
export const createReportAction = errorHandler(
  async (input: CreateReportInput) => {
    // Validate input
    const validatedInput = createReportSchema.parse(input);

    // Call query
    return await createReportQuery(validatedInput);
  }
);
