import { isBackendEnabled } from '../../../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { handleServiceError } from '../../../services/core/errorHandler';
import { FeatureEngine } from '../../feature-flags/featureEngine';
import type { PaymentMethod } from '../../optimization/types';
import { CommerceRepositoryError } from './index';

type PaymentMethodRow = {
  id: string;
  user_id: string;
  type: string;
  name: string;
  provider: string;
  metadata: Record<string, any>;
  status: string;
};

export class PaymentMethodMapper {
  static toDomain(row: PaymentMethodRow): PaymentMethod {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      status: row.status === 'active' ? 'active' : 'inactive',
      type: row.type as any,
      provider: row.provider,
      metadata: row.metadata,
    };
  }
}

export class PaymentMethodRepository {
  private static get useMock(): boolean {
    return !isBackendEnabled || !FeatureEngine.isEnabled('commerce_production_data');
  }

  static async getPaymentMethods(client: SupabaseClient, userId: string): Promise<PaymentMethod[]> {
    if (this.useMock) {
      // In mock mode, we expect the caller to fall back to the legacy adapter
      return [];
    }

    const { data, error } = await client
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw handleServiceError(error, 'DATABASE_ERROR');
    return data.map(PaymentMethodMapper.toDomain);
  }

  static async getPaymentMethodById(client: SupabaseClient, userId: string, id: string): Promise<PaymentMethod | null> {
    if (this.useMock) return null;

    const { data, error } = await client
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw handleServiceError(error, 'DATABASE_ERROR');
    return data ? PaymentMethodMapper.toDomain(data) : null;
  }

  static async updateUserMetadata(client: SupabaseClient, userId: string, id: string, name: string): Promise<void> {
    if (this.useMock) return;

    // Security: Explicitly ONLY updating user-controlled fields.
    const { error } = await client
      .from('payment_methods')
      .update({ name })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw handleServiceError(error, 'DATABASE_ERROR');
  }

  static async deactivatePaymentMethod(client: SupabaseClient, userId: string, id: string): Promise<void> {
    if (this.useMock) return;

    const { error } = await client
      .from('payment_methods')
      .update({ status: 'inactive' })
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw handleServiceError(error, 'DATABASE_ERROR');
  }
}
