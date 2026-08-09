import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommerceRepository } from '../repositories';
import { CommerceMapper } from '../mappers';
import { FeatureEngine } from '../../feature-flags/featureEngine';
import { supabase } from '../../../lib/supabase';

// Mock the feature engine to force Supabase path
vi.mock('../../feature-flags/featureEngine', () => ({
  FeatureEngine: {
    isEnabled: vi.fn(),
  },
}));

// Mock Supabase
vi.mock('../../../lib/supabase', () => {
  const fromMock = vi.fn();
  return {
    supabase: {
      from: fromMock,
    },
    isBackendEnabled: true,
  };
});

describe('Commerce Repository & Mapping Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (FeatureEngine.isEnabled as any).mockReturnValue(true); // force supabase route
  });

  describe('Categories', () => {
    it('should map categories correctly including hierarchy', () => {
      const mockRow = {
        id: 'cat-1',
        slug: 'shopping',
        name: 'Shopping',
        parent_id: 'cat-0',
        icon: 'bag',
        status: 'active',
        created_at: '',
        updated_at: ''
      };
      const domain = CommerceMapper.toCategory(mockRow);
      expect(domain.id).toBe('cat-1');
      expect(domain.parentId).toBe('cat-0');
      expect(domain.name).toBe('Shopping');
    });
  });

  describe('Partners', () => {
    it('should map partners correctly', () => {
      const mockRow = {
        id: 'part-1',
        slug: 'nike',
        name: 'Nike',
        primary_category_id: 'cat-1',
        description: 'Shoes',
        logo_url: 'url',
        is_sponsored: false,
        status: 'active',
        created_at: '',
        updated_at: ''
      };
      const domain = CommerceMapper.toPartner(mockRow);
      expect(domain.id).toBe('part-1');
      expect(domain.name).toBe('Nike');
      expect(domain.primaryCategoryId).toBe('cat-1');
    });

    it('should handle missing partner gracefully', async () => {
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase!.from as any).mockReturnValue({ select: selectMock });

      const result = await CommerceRepository.getPartnerById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Commerce Entities', () => {
    it('should map entities correctly and preserve partner relationship', () => {
      const mockRow = {
        id: 'ent-1',
        partner_id: 'part-1',
        category_id: 'cat-1',
        entity_type: 'product',
        name: 'Shoe',
        base_price: 100,
        currency: 'INR',
        destination_path: '/buy',
        image_url: 'img',
        sku: '123',
        is_sponsored: false,
        last_verified_at: '',
        status: 'active',
        created_at: '',
        updated_at: ''
      };
      const domain = CommerceMapper.toEntity(mockRow);
      expect(domain.id).toBe('ent-1');
      expect(domain.partnerId).toBe('part-1');
      expect(domain.basePrice).toBe(100);
    });
  });

  describe('Offers & Security', () => {
    it('should map offers correctly and preserve public eligibility metadata', () => {
      const mockRow = {
        id: 'off-1',
        source: 'merchant',
        offer_type: 'percentage_discount',
        value: 10,
        title: '10% off',
        description: 'Desc',
        min_spend: 100,
        max_discount: 50,
        valid_from: '2024-01-01',
        valid_until: '2030-01-01',
        eligibility_rules: { min_spend: 100 },
        internal_campaign_metadata: { secret: 'do-not-expose' }, // Not mapped!
        status: 'active',
        created_at: '',
        updated_at: ''
      };
      const domain = CommerceMapper.toOffer(mockRow as any);
      expect(domain.id).toBe('off-1');
      expect(domain.eligibilityRules).toEqual({ min_spend: 100 });
      // Verify security: internal metadata should not exist on the public domain object
      expect((domain as any).internal_campaign_metadata).toBeUndefined();
    });

    it('should filter expired and inactive offers in database query', async () => {
      const gteMock = vi.fn().mockResolvedValue({ data: [], error: null });
      const eqMock = vi.fn().mockReturnValue({ gte: gteMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      (supabase!.from as any).mockReturnValue({ select: selectMock });

      await CommerceRepository.getEligibleOffers();
      
      expect(eqMock).toHaveBeenCalledWith('status', 'active');
      expect(gteMock).toHaveBeenCalled();
    });
  });
});
