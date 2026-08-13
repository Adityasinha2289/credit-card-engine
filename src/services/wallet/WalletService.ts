import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../core/errors';
import { handleServiceError } from '../core/errorHandler';
import type { ServiceResponse } from '../core/types';
import type { Database } from '../../../lib/database.types';

export class WalletService {
  constructor(private client: SupabaseClient<Database>) {}

  async getWallet(userId: string): ServiceResponse<any[]> {
    try {
      const { data, error } = await this.client
        .from('user_cards')
        .select(`
          *,
          cards (*)
        `)
        .eq('user_id', userId);

      if (error) throw handleServiceError(error, 'DATABASE_ERROR');
      
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }

  async addCard(userId: string, cardId: string, limit: number = 0): ServiceResponse<any> {
    try {
      const { data, error } = await this.client
        .from('user_cards')
        .insert({
          user_id: userId,
          card_id: cardId,
          credit_limit: limit,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw handleServiceError(error, 'DATABASE_ERROR');
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }

  async removeCard(userId: string, userCardId: string): ServiceResponse<void> {
    try {
      const { error } = await this.client
        .from('user_cards')
        .delete()
        .eq('id', userCardId)
        .eq('user_id', userId);

      if (error) throw handleServiceError(error, 'DATABASE_ERROR');
      return { data: undefined as void, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }
}
