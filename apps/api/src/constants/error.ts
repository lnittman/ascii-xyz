/**
 * Common error messages as an enum to avoid magic strings
 */
export enum ErrorMessage {
  AUTHENTICATION_REQUIRED = 'Authentication is required',
  DATABASE_ERROR = 'A database error occurred',
  NOT_AUTHENTICATED = 'Authentication is required to access this resource',
  NOT_FOUND = 'The requested resource was not found',
  RATE_LIMITED = 'Rate limit exceeded. Try again later',
  SERVER_ERROR = 'An unexpected error occurred',
  UNAUTHORIZED = 'You are not authorized to perform this action',
  VALIDATION_ERROR = 'The provided data failed validation',
}

/**
 * Error types for standardized error responses
 */
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION_REQUIRED',
  AUTHORIZATION = 'AUTHORIZATION',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_PARAM = 'INVALID_PARAM',
  MISSING_PARAM = 'MISSING_PARAM',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION = 'VALIDATION_ERROR',
}

/**
 * Standard error messages for error types
 */
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.AUTHENTICATION]:
    'Authentication is required to access this resource',
  [ErrorType.AUTHORIZATION]: 'You are not authorized to perform this action',
  [ErrorType.BAD_REQUEST]: 'Invalid request parameters',
  [ErrorType.CONFLICT]: 'Resource conflict',
  [ErrorType.DATABASE_ERROR]: 'A database error occurred',
  [ErrorType.INVALID_PARAM]: 'Invalid parameter value provided',
  [ErrorType.MISSING_PARAM]: 'Required parameter is missing',
  [ErrorType.NOT_FOUND]: 'The requested resource was not found',
  [ErrorType.RATE_LIMITED]: 'Rate limit exceeded. Try again later',
  [ErrorType.SERVER_ERROR]: 'An unexpected error occurred',
  [ErrorType.UNAUTHORIZED]: 'You are not authorized to perform this action',
  [ErrorType.VALIDATION]: 'The provided data failed validation',
};
