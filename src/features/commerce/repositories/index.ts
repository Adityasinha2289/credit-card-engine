// @ts-nocheck
import { supabase, isBackendEnabled } from '../../../lib/supabase';
import { FeatureEngine } from '../../feature-flags/featureEngine';
import { CommerceMapper } from '../mappers';
import type { CommerceCategory, CommercePartner, CommerceEntity, CommerceOffer } from '../types';

export class CommerceRepositoryError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'CommerceRepositoryError';
  }
}

export class CommerceRepository {
  private static get useMock(): boolean {
    return !isBackendEnabled || !FeatureEngine.isEnabled('commerce_production_data');
  }

  // --- CATEGORIES ---
  static async getCategories(): Promise<CommerceCategory[]> {
    if (this.useMock) {
      return [
        { id: '1791e511-224e-41d7-aff7-650267bed62b', slug: 'shopping', name: 'Shopping', parentId: null, icon: null, status: 'active' },
        { id: 'e8221c11-7da3-4997-8d18-19cadfa844c0', slug: 'fitness', name: 'Fitness', parentId: null, icon: null, status: 'active' },
        { id: 'b79c0055-d232-401f-9875-d0f004b79b7f', slug: 'dining', name: 'Dining', parentId: null, icon: null, status: 'active' },
        { id: '43cc26b3-8c36-41e0-9cd9-5a1b346f4260', slug: 'travel', name: 'Travel', parentId: null, icon: null, status: 'active' },
        { id: 'ae19bca5-9d2b-4241-9905-54c36b6ec8db', slug: 'accommodation', name: 'Accommodation', parentId: null, icon: null, status: 'active' },
        { id: 'a7033d1b-cb17-4452-bc74-dceacd1b2c1d', slug: 'transport', name: 'Transport', parentId: null, icon: null, status: 'active' },
        { id: '35310e0d-b469-47fc-bfde-6621810565f8', slug: 'entertainment', name: 'Entertainment', parentId: null, icon: null, status: 'active' },
      ];
    }
    const { data, error } = await supabase!.from('categories').select('*').eq('status', 'active');
    if (error) throw new CommerceRepositoryError('Failed to fetch categories', error.code);
    return data.map(CommerceMapper.toCategory);
  }

  // --- PARTNERS ---
  static async getPartners(categoryId?: string): Promise<CommercePartner[]> {
    if (this.useMock) {
      return [];
    }

    let query = supabase!.from('partners').select('*').eq('status', 'active');
    if (categoryId) query = query.eq('primary_category_id', categoryId);
    const { data, error } = await query;
    if (error) throw new CommerceRepositoryError('Failed to fetch partners', error.code);
    return data.map(CommerceMapper.toPartner);
  }

  static async getPartnerById(id: string): Promise<CommercePartner | null> {
    if (this.useMock) {
      const partners = await this.getPartners();
      return partners.find(p => p.id === id) || null;
    }
    const { data, error } = await supabase!.from('partners').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw new CommerceRepositoryError('Failed to fetch partner', error.code);
    return data ? CommerceMapper.toPartner(data) : null;
  }

  // --- PRODUCTS / ENTITIES ---
  static async getCommerceEntities(partnerId?: string): Promise<CommerceEntity[]> {
    if (this.useMock) {
      return [];
    }
    
    let query = supabase!.from('commerce_entities').select('*').eq('status', 'active');
    if (partnerId) query = query.eq('partner_id', partnerId);
    const { data, error } = await query;
    if (error) throw new CommerceRepositoryError('Failed to fetch entities', error.code);
    return data.map(CommerceMapper.toEntity);
  }

  // --- OFFERS ---
  /**
   * getEligibleOffers has been updated in Stage 5 to route through the secure server-side orchestrator.
   * This guarantees RLS safety, canonical wallet injection, and prevents N+1 queries.
   */
  static async getEligibleOffers(context?: { merchantId?: string, transactionAmount?: number }): Promise<CommerceOffer[]> {
    if (this.useMock) {
      return [];
    }

    try {
      // Get auth token from Clerk or dashboard store dynamically
      let token = '';
      if (typeof window !== 'undefined' && window.Clerk && window.Clerk.session) {
        token = await window.Clerk.session.getToken();
      }

      const response = await fetch('/api/offers/eligible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(context || {})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch eligible offers');
      }

      return result.eligibleOffers;
    } catch (error: any) {
      console.error('[CommerceRepository] getEligibleOffers failed:', error);
      throw new CommerceRepositoryError('Failed to fetch eligible offers from API', error.code);
    }
  }
}
export * from './PaymentMethodRepository';
