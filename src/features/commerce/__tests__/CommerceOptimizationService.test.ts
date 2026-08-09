import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommerceOptimizationService } from '../services/CommerceOptimizationService';
import { CommerceRepository } from '../repositories';
import { PaymentMethodProvider } from '../services/PaymentMethodProvider';
import { OptimizationEngine } from '../../optimization/engine/optimizationEngine';

vi.mock('../repositories', () => ({
  CommerceRepository: {
    getEligibleOffers: vi.fn(),
    getCommerceEntities: vi.fn(),
  }
}));

vi.mock('../services/PaymentMethodProvider', () => ({
  PaymentMethodProvider: {
    getUserPaymentMethods: vi.fn(),
  }
}));

vi.mock('../../optimization/engine/optimizationEngine', () => ({
  OptimizationEngine: {
    optimizeSpending: vi.fn(),
  }
}));

describe('CommerceOptimizationService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('optimizeEntity', () => {
    it('fetches necessary components and calculates optimization', async () => {
      const mockEntity = {
        id: 'e-1',
        partnerId: 'p-1',
        name: 'Test Product',
        basePrice: 1000,
        currency: 'INR',
        entityType: 'product' as const,
        status: 'active' as const
      };

      const mockCommerceOffer = {
        id: 'o-1',
        title: '10% Off',
        offerType: 'percentage_discount' as const,
        value: 10,
        source: 'merchant' as const,
        status: 'active' as const,
        validFrom: '2020',
        validUntil: '2030',
        eligibilityRules: { minSpend: 500 }
      };

      const mockPaymentMethod = {
        id: 'pm-1',
        userId: 'u-1',
        name: 'Card',
        status: 'active' as const,
        type: 'credit_card' as const,
        provider: 'HDFC',
        metadata: {}
      };

      (CommerceRepository.getEligibleOffers as any).mockResolvedValue([mockCommerceOffer]);
      (PaymentMethodProvider.getUserPaymentMethods as any).mockResolvedValue([mockPaymentMethod]);
      
      const mockResult = {
        totalValue: 100,
        effectiveCost: 900
      };
      
      (OptimizationEngine.optimizeSpending as any).mockReturnValue(mockResult);

      const result = await CommerceOptimizationService.optimizeEntity(mockEntity, 'u-1');

      // Verify orchestration
      expect(CommerceRepository.getEligibleOffers).toHaveBeenCalled();
      expect(PaymentMethodProvider.getUserPaymentMethods).toHaveBeenCalledWith('u-1');
      
      // Verify adapter transformed offer correctly
      expect(OptimizationEngine.optimizeSpending).toHaveBeenCalledWith(
        expect.objectContaining({
          baseAmount: 1000,
          id: 'e-1'
        }),
        [mockPaymentMethod],
        [expect.objectContaining({
          id: 'o-1',
          name: '10% Off',
          eligibility: { minSpend: 500 }
        })]
      );

      expect(result).toBe(mockResult);
    });
  });

  describe('optimizeCollection', () => {
    it('returns array of mapped entities with results', async () => {
      const mockEntity = {
        id: 'e-1',
        partnerId: 'p-1',
        name: 'Test Product',
        basePrice: 1000,
        currency: 'INR',
        entityType: 'product' as const,
        status: 'active' as const
      };

      (CommerceRepository.getCommerceEntities as any).mockResolvedValue([mockEntity]);
      (CommerceRepository.getEligibleOffers as any).mockResolvedValue([]);
      (PaymentMethodProvider.getUserPaymentMethods as any).mockResolvedValue([]);
      
      const mockResult = { effectiveCost: 1000 };
      (OptimizationEngine.optimizeSpending as any).mockReturnValue(mockResult);

      const results = await CommerceOptimizationService.optimizeCollection('u-1');

      expect(results).toHaveLength(1);
      expect(results[0].entity).toBe(mockEntity);
      expect(results[0].result).toBe(mockResult);
    });
  });
});
