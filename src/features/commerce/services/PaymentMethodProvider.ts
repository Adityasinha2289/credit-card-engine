import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { PaymentMethodRepository } from '../repositories/PaymentMethodRepository';
import { adaptUserCardsToPaymentMethods } from '../../optimization/adapters/cardAdapter';
import type { PaymentMethod } from '../../optimization/types';

export class PaymentMethodProvider {
  /**
   * Controlled Read Strategy:
   * 1. Attempts to fetch from production `payment_methods` (if backend enabled & flag active).
   * 2. If production data is empty or mock is active, falls back to legacy `userCards` via `cardAdapter`.
   * 
   * This provides seamless equivalent data to the Optimization Engine.
   */
  static async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {


    try {
      const { supabaseClient } = useDashboardStore.getState();
      if (!supabaseClient) throw new Error('Supabase client not initialized');
      
      const productionMethods = await PaymentMethodRepository.getPaymentMethods(supabaseClient as any, userId);
      
      // If production returned valid records, use them.
      // (If the repo is in mock mode, it will return [])
      if (productionMethods.length > 0) {
        return productionMethods;
      }
    } catch (err) {
      console.warn('[PaymentMethodProvider] Failed to fetch production methods. Falling back to legacy.', err);
    }

    // Fallback path
    return this.getLegacyFallback(userId);
  }

  private static getLegacyFallback(userId: string): PaymentMethod[] {
    const { userCards } = useDashboardStore.getState();
    return adaptUserCardsToPaymentMethods(userCards, userId);
  }
}
