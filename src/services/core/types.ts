import { AppError } from './errors';

export type ServiceResponse<T> = Promise<
  | { data: T; error: null }
  | { data: null; error: AppError }
>;
