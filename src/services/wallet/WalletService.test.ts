import { describe, it, expect, vi } from 'vitest';
import { WalletService } from './WalletService';

describe('WalletService', () => {
  it('handles database errors cleanly', async () => {
    const mockClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'Duplicate key' } })
    } as any;
    
    const service = new WalletService(mockClient);
    const response = await service.getWallet('test_user');
    
    expect(response.error).not.toBeNull();
    expect(response.error?.code).toBe('CONFLICT');
    expect(response.data).toBeNull();
  });

  it('returns valid data on success', async () => {
    const mockClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [{ id: 'card_1' }], error: null })
    } as any;
    
    const service = new WalletService(mockClient);
    const response = await service.getWallet('test_user');
    
    expect(response.error).toBeNull();
    expect(response.data).toEqual([{ id: 'card_1' }]);
  });
});
