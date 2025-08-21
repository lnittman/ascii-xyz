/**
 * Service-level error class
 * Minimal error handling for the services package
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Common error types as simple string constants
export const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFLICT: 'CONFLICT',
} as const;

// Helper functions for common errors
export const notFound = (message: string) =>
  new ServiceError(message, 404, ErrorCodes.NOT_FOUND);
export const unauthorized = (message: string) =>
  new ServiceError(message, 401, ErrorCodes.UNAUTHORIZED);
export const badRequest = (message: string) =>
  new ServiceError(message, 400, ErrorCodes.BAD_REQUEST);
export const conflict = (message: string) =>
  new ServiceError(message, 409, ErrorCodes.CONFLICT);
export const internalError = (message: string) =>
  new ServiceError(message, 500, ErrorCodes.INTERNAL_ERROR);
