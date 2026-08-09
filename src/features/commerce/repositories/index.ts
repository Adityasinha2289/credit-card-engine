import { supabase, isBackendEnabled } from '../../../lib/supabase';
import { FeatureEngine } from '../../feature-flags/featureEngine';
import { CommerceMapper } from '../mappers';
import type { CommerceCategory, CommercePartner, CommerceEntity, CommerceOffer } from '../types';
import { MOCK_PARTNERS as OPTIMIZATION_MOCK_PARTNERS } from '../../optimization/mock/partners';
import { MOCK_OFFERS } from '../../optimization/mock/offers';
import { MOCK_PRODUCTS } from '../../lifestyle/mock/products';
import { MOCK_PARTNERS as LIFESTYLE_MOCK_PARTNERS } from '../../lifestyle/mock/partners';

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
      const all = LIFESTYLE_MOCK_PARTNERS.map(p => ({
        id: p.id,
        slug: p.id,
        name: p.name,
        primaryCategoryId: p.category,
        description: p.description || null,
        logoUrl: p.imageUrl || null,
        status: 'active'
      }));
      // Optimization has additional partners (Uber, Taj)
      const opt = OPTIMIZATION_MOCK_PARTNERS.map(p => ({
        id: p.id,
        slug: p.id,
        name: p.name,
        primaryCategoryId: p.category,
        description: null,
        logoUrl: null,
        status: 'active'
      }));
      const merged = [...all];
      for (const o of opt) {
        if (!merged.find(m => m.id === o.id)) merged.push(o);
      }
      if (categoryId) return merged.filter(m => m.primaryCategoryId === categoryId);
      return merged;
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

  // --- ENTITIES ---
  static async getCommerceEntities(partnerId?: string): Promise<CommerceEntity[]> {
    if (this.useMock) {
      const mock = MOCK_PRODUCTS.map(p => ({
        id: p.id,
        partnerId: p.partnerId,
        categoryId: null,
        entityType: 'product',
        name: p.name,
        basePrice: p.originalPrice,
        currency: 'INR',
        destinationPath: '',
        imageUrl: p.imageUrl || null,
        sku: null,
        status: 'active'
      }));
      if (partnerId) return mock.filter(m => m.partnerId === partnerId);
      return mock;
    }
    
    let query = supabase!.from('commerce_entities').select('*').eq('status', 'active');
    if (partnerId) query = query.eq('partner_id', partnerId);
    const { data, error } = await query;
    if (error) throw new CommerceRepositoryError('Failed to fetch entities', error.code);
    return data.map(CommerceMapper.toEntity);
  }

  // --- OFFERS ---
  static async getEligibleOffers(): Promise<CommerceOffer[]> {
    if (this.useMock) {
      return MOCK_OFFERS.map(o => ({
        id: o.id,
        source: o.source as any,
        offerType: o.type as any,
        value: o.value,
        title: o.name,
        description: o.description,
        minSpend: o.eligibility?.minSpend || null,
        maxDiscount: o.eligibility?.maxDiscount || null,
        validFrom: '2024-01-01',
        validUntil: '2030-12-31',
        eligibilityRules: o.eligibility,
        status: 'active'
      }));
    }

    const { data, error } = await supabase!
      .from('offers')
      .select('id, source, offer_type, value, title, description, min_spend, max_discount, valid_from, valid_until, eligibility_rules, status')
      .eq('status', 'active')
      .gte('valid_until', new Date().toISOString());

    if (error) throw new CommerceRepositoryError('Failed to fetch offers', error.code);
    return data.map(CommerceMapper.toOffer);
  }
}
export * from './PaymentMethodRepository';
