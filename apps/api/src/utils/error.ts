import type { ZodError } from 'zod';

import type { ResourceType } from '../constants';
import { ERROR_MESSAGES, ErrorType } from '../constants';

/**
 * Custom error class with error type
 */
export class ApiError extends Error {
  details?: any;
  status: number;
  code: ErrorType;

  constructor(code: ErrorType, message?: string, details?: any) {
    super(message || ERROR_MESSAGES[code]);

    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = this.getStatusCode(code);
  }

  /**
   * Map error types to HTTP status codes
   */
  private getStatusCode(type: ErrorType): number {
    switch (type) {
      case ErrorType.NOT_FOUND:
        return 404;
      case ErrorType.AUTHENTICATION:
        return 401;
      case ErrorType.AUTHORIZATION:
        return 403;
      case ErrorType.VALIDATION:
      case ErrorType.BAD_REQUEST:
      case ErrorType.INVALID_PARAM:
      case ErrorType.MISSING_PARAM:
        return 400;
      case ErrorType.RATE_LIMITED:
        return 429;
      default:
        return 500;
    }
  }

  // Helper for resource not found errors
  static notFound(resource: ResourceType | string, id?: string): ApiError {
    return new ApiError(
      ErrorType.NOT_FOUND,
      `${resource} not found`,
      id ? { id } : undefined
    );
  }

  // Helper for database-related errors
  static database(message?: string, details?: any): ApiError {
    return new ApiError(
      ErrorType.DATABASE_ERROR,
      message || ERROR_MESSAGES[ErrorType.DATABASE_ERROR],
      details
    );
  }

  // Helper for unauthorized errors
  static unauthorized(message?: string): ApiError {
    return new ApiError(
      ErrorType.AUTHORIZATION,
      message || ERROR_MESSAGES[ErrorType.AUTHORIZATION]
    );
  }

  // Helper for authentication errors
  static unauthenticated(message?: string): ApiError {
    return new ApiError(
      ErrorType.AUTHENTICATION,
      message || ERROR_MESSAGES[ErrorType.AUTHENTICATION]
    );
  }

  // Helper for validation errors
  static validation(details: any): ApiError {
    return new ApiError(
      ErrorType.VALIDATION,
      ERROR_MESSAGES[ErrorType.VALIDATION],
      details
    );
  }

  // Helper for invalid parameter errors
  static invalidParam(param: string, message?: string): ApiError {
    return new ApiError(
      ErrorType.INVALID_PARAM,
      message || `Invalid value for parameter: ${param}`,
      { param }
    );
  }

  // Helper for missing parameter errors
  static missingParam(param: string | string[]): ApiError {
    const params = Array.isArray(param) ? param : [param];
    const paramList = params.join(', ');
    return new ApiError(
      ErrorType.MISSING_PARAM,
      `Missing required parameter${params.length > 1 ? 's' : ''}: ${paramList}`,
      { params }
    );
  }

  /**
   * Format the error for HTTP response
   */
  toResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Convert a Zod error to an ApiError
 */
export function handleZodError(error: ZodError): ApiError {
  // Format the validation errors in a more user-friendly way
  const details = error.errors.reduce(
    (acc, curr) => {
      const path = curr.path.join('.');
      acc[path] = curr.message;
      return acc;
    },
    {} as Record<string, string>
  );

  return new ApiError(ErrorType.VALIDATION, 'Validation error', details);
}
