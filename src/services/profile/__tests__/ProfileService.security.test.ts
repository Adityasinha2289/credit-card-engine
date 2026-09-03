import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '../ProfileService';
import { SupabaseClient } from '@supabase/supabase-js';

describe('ProfileService Security - Explicit Allowlist', () => {
  let mockSupabaseClient: Partial<SupabaseClient>;
  let profileService: ProfileService;

  beforeEach(() => {
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'test-user-id' }, error: null }),
    };

    profileService = new ProfileService(mockSupabaseClient as unknown as SupabaseClient<any>);
  });

  it('explicitly allows only legitimate profile fields and discards all others', async () => {
    const maliciousPayload = {
      name: 'Hacker User',
      phone: '1234567890',
      salary: 500000,
      
      // Known protected fields
      total_reward_points: 9999999,
      redeemed_reward_points: 0,
      
      // Unknown/future protected fields
      role: 'admin',
      is_super_admin: true,
      email: 'hacker@example.com',
      id: 'some-other-id',
      created_at: '2000-01-01T00:00:00Z',
      
      // Random garbage
      random_garbage: 'should be ignored',
    };

    await profileService.updateProfile('test-user-id', maliciousPayload);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    
    // Ensure the payload passed to update() ONLY contains the allowlisted fields
    expect(mockSupabaseClient.update).toHaveBeenCalledWith({
      name: 'Hacker User',
      phone: '1234567890',
      salary: 500000,
    });
    
    // Explicitly verify protected/unknown fields are NOT included
    expect(mockSupabaseClient.update).not.toHaveBeenCalledWith(expect.objectContaining({
      total_reward_points: 9999999
    }));
    expect(mockSupabaseClient.update).not.toHaveBeenCalledWith(expect.objectContaining({
      role: 'admin'
    }));
    expect(mockSupabaseClient.update).not.toHaveBeenCalledWith(expect.objectContaining({
      id: 'some-other-id'
    }));
  });
  
  it('returns an error if no valid fields are provided', async () => {
    const payload = {
      role: 'admin',
      some_garbage: true
    };
    
    const result = await profileService.updateProfile('test-user-id', payload);
    expect(result.error).not.toBeNull();
    expect(result.error?.message).toContain('No valid fields');
    expect(mockSupabaseClient.update).not.toHaveBeenCalled();
  });
});
