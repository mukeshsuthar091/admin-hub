/**
 * Meaningful success messages categorized by module and action.
 */
export const SUCCESS_MESSAGES = {
  GENERAL: {
    FETCHED: 'Resource(s) fetched successfully.',
    CREATED: 'Resource created successfully.',
    UPDATED: 'Resource updated successfully.',
    DELETED: 'Resource deleted successfully.',
    OPERATION_SUCCESS: 'Operation completed successfully.',
  },
  AUTH: {
    LOGIN_SUCCESS: 'Login successful.',
    REGISTER_SUCCESS: 'User registered successfully.',
    LOGOUT_SUCCESS: 'Logout successful.',
    PASSWORD_RESET_SENT: 'Password reset link sent successfully.',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
    TOKEN_REFRESHED: 'Access token refreshed successfully.',
  },
  USER: {
    PROFILE_FETCHED: 'User profile fetched successfully.',
    PROFILE_UPDATED: 'User profile updated successfully.',
    PASSWORD_CHANGED: 'Password changed successfully.',
  },
} as const;

/**
 * Meaningful error messages categorized by module and failure type.
 */
export const ERROR_MESSAGES = {
  GENERAL: {
    INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    BAD_REQUEST: 'Invalid request payload or parameters.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'Authentication credentials are required or invalid.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    CONFLICT: 'Resource conflict occurred.',
    TOO_MANY_REQUESTS: 'Too many requests. Please slow down and try again later.',
    VALIDATION_FAILED: 'Request validation failed.',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    UNAUTHORIZED: 'Invalid or expired authentication token.',
    TOKEN_EXPIRED: 'Token has expired. Please log in again.',
    ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
    EMAIL_ALREADY_EXISTS: 'User with this email already exists.',
  },
  DATABASE: {
    CONNECTION_FAILED: 'Database connection failed.',
    QUERY_FAILED: 'Database query failed.',
    RECORD_NOT_FOUND: 'Database record not found.',
  },
} as const;
