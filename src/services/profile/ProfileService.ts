// @ts-nocheck
import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../core/errors';
import { handleServiceError } from '../core/errorHandler';
import type { ServiceResponse } from '../core/types';
import type { Database } from '../../lib/database.types';

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
      // Security: Explicit Allowlist for profile updates to prevent mass assignment
      const allowedFields = [
        'name', 'phone', 'avatar_url', 'salary', 'credit_score', 
        'onboarding_completed', 'user_segment', 'primary_goal', 
        'spend_categories', 'city', 'occupation'
      ];
      
      const safeUpdates: Record<string, any> = {};
      for (const field of allowedFields) {
        if (field in updates) {
          safeUpdates[field] = updates[field];
        }
      }

      // If no valid fields to update, return early
      if (Object.keys(safeUpdates).length === 0) {
        return { data: null, error: handleServiceError(new Error("No valid fields provided for update")) };
      }

      const { data, error } = await this.client
        .from('users')
        .update(safeUpdates)
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
