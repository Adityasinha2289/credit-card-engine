import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../core/errors';
import { handleServiceError } from '../core/errorHandler';
import type { ServiceResponse } from '../core/types';
import type { Database } from '../../../lib/database.types';

export class ProfileService {
  constructor(private client: SupabaseClient<Database>) {}

  async getProfile(userId: string): ServiceResponse<any> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw handleServiceError(error, 'DATABASE_ERROR');
      
      return { data: data || null, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }

  async getProfileByEmail(email: string): ServiceResponse<any> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw handleServiceError(error, 'DATABASE_ERROR');
      
      return { data: data || null, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }

  async updateProfile(userId: string, updates: Record<string, any>): ServiceResponse<any> {
    try {
      const { data, error } = await this.client
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw handleServiceError(error, 'DATABASE_ERROR');
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }
}
