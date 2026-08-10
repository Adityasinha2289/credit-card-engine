import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadWalletIntelligence } from '../walletIntelligence';
import { CommerceOptimizationService } from '../../../features/commerce';

// Mock dependencies
vi.mock('../../../features/commerce', () => ({
  CommerceOptimizationService: {
    optimizeCollection: vi.fn(),
  },
}));

describe('Wallet Intelligence Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1 & 4. calculates intelligence correctly from OptimizationResults', async () => {
    const mockOptimizationResult = [
      {
        entity: { categoryId: 'dining' },
        result: { totalValue: 500, bestCard: { name: 'HDFC Diners Club' } }
      },
      {
        entity: { categoryId: 'shopping' },
        result: { totalValue: 700, bestCard: { name: 'SBI Cashback' } }
      },
      {
        entity: { categoryId: 'travel' },
        result: { totalValue: 0, bestCard: null } // Not covered
      }
    ];

    (CommerceOptimizationService.optimizeCollection as any).mockResolvedValue(mockOptimizationResult);

    const result = await loadWalletIntelligence('u-1');

    // 2. Optimization results calculated correctly
    expect(result.isEmpty).toBe(false);
    expect(result.availableValue).toBe(1200);
    // Coverage = 2 covered / 3 total = 67%
    expect(result.coveragePercent).toBe(67);
    
    // Check paths are rendered
    expect(result.topPaths[0].card).toBe('SBI Cashback');
    expect(result.topPaths[1].card).toBe('HDFC Diners Club');
    expect(result.topPaths).toHaveLength(2);
  });

  it('3. returns empty state when no eligible offers are returned', async () => {
    const mockOptimizationResult = [
      {
        entity: { categoryId: 'dining' },
        result: { totalValue: 0, bestCard: null }
      }
    ];

    (CommerceOptimizationService.optimizeCollection as any).mockResolvedValue(mockOptimizationResult);

    const result = await loadWalletIntelligence('u-1');
    expect(result.isEmpty).toBe(true);
    expect(result.availableValue).toBe(0);
    expect(result.coveragePercent).toBe(0);
  });

  it('5. bubbles up errors when optimization fails', async () => {
    (CommerceOptimizationService.optimizeCollection as any).mockRejectedValue(new Error('Network error'));
    await expect(loadWalletIntelligence('u-1')).rejects.toThrow('Network error');
  });

  it('6. demo mode flows correctly through the same pipeline', async () => {
    (CommerceOptimizationService.optimizeCollection as any).mockResolvedValue([]);
    await loadWalletIntelligence('demo-user-id');
    expect(CommerceOptimizationService.optimizeCollection).toHaveBeenCalledWith('demo-user-id');
  });

  it('7. contains no hardcoded financial recommendation values', async () => {
    // We supply weird mock data, ensure it bubbles exactly up
    const mockOptimizationResult = [
      {
        entity: { categoryId: 'health' },
        result: { totalValue: 999, bestCard: { name: 'Test Card' } }
      }
    ];

    (CommerceOptimizationService.optimizeCollection as any).mockResolvedValue(mockOptimizationResult);

    const result = await loadWalletIntelligence('u-1');
    expect(result.availableValue).toBe(999);
    
    // Ensure the output is NOT the old mock
    expect(result.availableValue).not.toBe(12480);
    expect(result.availableValue).not.toBe(420);
    expect(result.topPaths[0].card).not.toBe('Axis Vistara');
  });
});
