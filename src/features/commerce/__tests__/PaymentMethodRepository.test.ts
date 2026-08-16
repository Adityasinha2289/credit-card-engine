import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentMethodRepository } from '../repositories/PaymentMethodRepository';
import { PaymentMethodProvider } from '../services/PaymentMethodProvider';
import { FeatureEngine } from '../../feature-flags/featureEngine';
import { supabase } from '../../../lib/supabase';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';

// Mock dependencies
vi.mock('../../feature-flags/featureEngine', () => ({
  FeatureEngine: {
    isEnabled: vi.fn(),
  },
}));

vi.mock('../../../lib/supabase', () => {
  const fromMock = vi.fn();
  return {
    supabase: {
      from: fromMock,
    },
    isBackendEnabled: true,
  };
});

describe('Payment Method Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('PaymentMethodRepository Security Bounds', () => {
    it('should map production schema to isolated Domain Object', async () => {
      (FeatureEngine.isEnabled as any).mockReturnValue(true);
      
      const mockRow = {
        id: 'pm-1',
        user_id: 'user-1',
        type: 'credit_card',
        name: 'HDFC Visa',
        provider: 'HDFC',
        metadata: { network: 'Visa', panLast4: '1234' },
        status: 'active',
      };
      
      const eqMock2 = vi.fn().mockResolvedValue({ data: [mockRow], error: null });
      const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock1 });
      (supabase!.from as any).mockReturnValue({ select: selectMock });

      const results = await PaymentMethodRepository.getPaymentMethods(supabase as any, 'user-1');
      const pm = results[0];

      expect(pm.id).toBe('pm-1');
      expect(pm.userId).toBe('user-1');
      expect(pm.type).toBe('credit_card');
      expect(pm.provider).toBe('HDFC');
      expect(pm.metadata.panLast4).toBe('1234');
      
      // Ensure backend filters exist
      expect(eqMock1).toHaveBeenCalledWith('user_id', 'user-1');
      expect(eqMock2).toHaveBeenCalledWith('status', 'active');
    });

    it('should explicitly only allow updates to user-controlled metadata', async () => {
      (FeatureEngine.isEnabled as any).mockReturnValue(true);

      const eqMock2 = vi.fn().mockResolvedValue({ error: null });
      const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock1 });
      (supabase!.from as any).mockReturnValue({ update: updateMock });

      await PaymentMethodRepository.updateUserMetadata(supabase as any, 'user-1', 'pm-1', 'My Custom Name');
      
      // Prove that it ONLY passes `name` to the update query
      expect(updateMock).toHaveBeenCalledWith({ name: 'My Custom Name' });
    });
  });

  describe('PaymentMethodProvider Fallback Logic', () => {
    it('should fallback to cardAdapter and dashboardStore when production is disabled', async () => {
      (FeatureEngine.isEnabled as any).mockReturnValue(false); // Disable production
      
      // Setup legacy store mock
      vi.spyOn(useDashboardStore, 'getState').mockReturnValue({
        userCards: [
          {
            id: 'legacy-1',
            pan: '1111222233334444',
            cardholderName: 'Test User',
            expiry: '12/25',
            network: 'Mastercard',
            bank: 'ICICI',
            status: 'active',
            availableCredit: 10000,
            creditLimit: 10000,
            label: 'My ICICI',
          }
        ]
      } as any);

      const pms = await PaymentMethodProvider.getUserPaymentMethods('user-1');
      
      expect(pms).toHaveLength(1);
      expect(pms[0].id).toBe('legacy-1');
      expect(pms[0].name).toBe('My ICICI');
      expect(pms[0].provider).toBe('ICICI');
      expect(pms[0].metadata.network).toBe('Mastercard');
      expect(pms[0].metadata.legacy_card_id).toBe('legacy-1'); // mapped correctly
    });
    
    it('should force fallback for demo-user-id regardless of feature flag', async () => {
      (FeatureEngine.isEnabled as any).mockReturnValue(true); 
      
      vi.spyOn(useDashboardStore, 'getState').mockReturnValue({
        userCards: [
          {
            id: 'demo-card-1',
            pan: '1111222233334444',
            cardholderName: 'Demo User',
            expiry: '12/25',
            network: 'Visa',
            bank: 'HDFC',
            status: 'active',
            availableCredit: 100,
            creditLimit: 100,
          }
        ]
      } as any);

      // No supabase mock configured, but since it's demo-user, it shouldn't be called
      const pms = await PaymentMethodProvider.getUserPaymentMethods('demo-user-id');
      
      expect(pms).toHaveLength(1);
      expect(pms[0].id).toBe('demo-card-1');
    });
  });
});
