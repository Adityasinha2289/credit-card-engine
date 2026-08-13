import { AppError, type AppErrorCode } from './errors';

export function handleServiceError(error: any, defaultCode: AppErrorCode = 'UNKNOWN_ERROR'): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  console.error('[Service Error]', error);

  if (error?.code === 'PGRST301') {
    return new AppError('AUTHENTICATION_REQUIRED', 'Please sign in to continue.');
  }

  // Handle generic PostgREST errors loosely
  if (error?.code && error.code.startsWith('23')) {
    return new AppError('CONFLICT', 'A data conflict occurred.', error);
  }

  return new AppError(
    defaultCode,
    error?.message || 'An unexpected error occurred.',
    error
  );
}
