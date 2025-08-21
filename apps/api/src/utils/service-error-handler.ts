import { ServiceError } from '@repo/services/lib/errors';
import { ErrorType } from '../constants';
import { ApiError } from './error';

/**
 * Convert ServiceError to ApiError for consistent error handling
 */
export function handleServiceError(error: unknown): never {
  if (error instanceof ServiceError) {
    // Map ServiceError to ApiError
    let errorType: ErrorType;

    switch (error.statusCode) {
      case 400:
        errorType = ErrorType.BAD_REQUEST;
        break;
      case 401:
        errorType = ErrorType.UNAUTHORIZED;
        break;
      case 404:
        errorType = ErrorType.NOT_FOUND;
        break;
      case 409:
        errorType = ErrorType.CONFLICT;
        break;
      default:
        errorType = ErrorType.SERVER_ERROR;
    }

    throw new ApiError(errorType, error.message);
  }

  // Re-throw if it's already an ApiError
  if (error instanceof ApiError) {
    throw error;
  }

  // Handle unknown errors
  throw new ApiError(
    ErrorType.SERVER_ERROR,
    error instanceof Error ? error.message : 'An unknown error occurred'
  );
}
