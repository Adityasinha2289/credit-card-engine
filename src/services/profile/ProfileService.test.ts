import { describe, it, expect, vi } from 'vitest';
import { ProfileService } from './ProfileService';

describe('ProfileService', () => {
  it('handles database errors gracefully', async () => {
    const mockClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: '123', message: 'DB Error' } }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { code: '123', message: 'DB Error' } })
    } as any;
    
    const service = new ProfileService(mockClient);
    const response = await service.getProfile('test_user');
    
    expect(response.error).not.toBeNull();
    expect(response.error?.code).toBe('DATABASE_ERROR');
    expect(response.data).toBeNull();
  });

  it('updates profile securely', async () => {
    const mockClient = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'test_user', salary: 100 }, error: null })
    } as any;
    
    const service = new ProfileService(mockClient);
    const response = await service.updateProfile('test_user', { salary: 100 });
    
    expect(response.error).toBeNull();
    expect(response.data?.salary).toBe(100);
  });
});
