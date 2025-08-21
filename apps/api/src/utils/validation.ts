import { ZodError } from 'zod';

import { ApiError, handleZodError } from './error';

/**
 * Validate pagination parameters from search params
 */
export function validatePaginationParams(params: URLSearchParams) {
  const limit = params.get('limit');
  const offset = params.get('offset');
  const page = params.get('page');

  if (limit !== null && Number.isNaN(Number(limit))) {
    throw ApiError.invalidParam('limit', 'Limit must be a number');
  }

  if (offset !== null && Number.isNaN(Number(offset))) {
    throw ApiError.invalidParam('offset', 'Offset must be a number');
  }

  if (page !== null && Number.isNaN(Number(page))) {
    throw ApiError.invalidParam('page', 'Page must be a number');
  }

  return {
    limit: limit !== null ? Math.min(Math.max(Number(limit), 1), 100) : 20,
    offset:
      offset !== null
        ? Math.max(Number(offset), 0)
        : page !== null
          ? (Math.max(Number(page), 1) - 1) *
            (limit !== null ? Number(limit) : 20)
          : 0,
  };
}

/**
 * Validate required query parameters
 */
export function validateRequiredParams(
  params: URLSearchParams,
  required: string[]
) {
  const missing = required.filter((param) => !params.has(param));

  if (missing.length > 0) {
    throw ApiError.missingParam(missing);
  }
}

/**
 * Safely validate input with a Zod schema and handle errors
 */
export async function validateWith<T, R>(
  schema: { parse: (data: T) => R },
  data: T
): Promise<R> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw handleZodError(error);
    }
    throw error;
  }
}
