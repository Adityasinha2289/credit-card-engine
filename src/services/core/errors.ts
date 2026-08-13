export type AppErrorCode =
  | 'AUTHENTICATION_REQUIRED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTELLIGENCE_ERROR'
  | 'INSUFFICIENT_DATA'
  | 'UNKNOWN_ERROR';

export class AppError extends Error {
  constructor(
    public code: AppErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}
