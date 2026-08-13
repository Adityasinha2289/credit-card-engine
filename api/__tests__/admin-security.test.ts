import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAdminAuthorization } from '../admin/_utils/auth';
import * as clerkBackend from '@clerk/backend';

vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn(),
}));

describe('Admin Authorization Utilities (Security Hardened)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv, CLERK_SECRET_KEY: 'sk_test_123' };
  });

  it('rejects requests without authorization header', async () => {
    const req = { headers: {} } as any;
    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('Missing or invalid Authorization header');
  });

  it('rejects requests if CLERK_SECRET_KEY is missing', async () => {
    process.env.CLERK_SECRET_KEY = undefined;
    const req = { headers: { authorization: 'Bearer some.token.here' } } as any;
    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('Server configuration error');
  });

  it('rejects malformed or tampered tokens (verification throws)', async () => {
    vi.mocked(clerkBackend.verifyToken).mockRejectedValueOnce(new Error('jwt malformed'));
    const req = { headers: { authorization: 'Bearer bad.token' } } as any;
    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('Invalid or expired token');
  });

  it('rejects expired tokens', async () => {
    vi.mocked(clerkBackend.verifyToken).mockRejectedValueOnce(new Error('jwt expired'));
    const req = { headers: { authorization: 'Bearer expired.token' } } as any;
    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('Invalid or expired token');
  });

  it('rejects non-admin Clerk tokens', async () => {
    vi.mocked(clerkBackend.verifyToken).mockResolvedValueOnce({
      sub: 'user-1',
      publicMetadata: { role: 'user' },
    } as any);
    const req = { headers: { authorization: `Bearer valid.user.token` } } as any;
    
    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('User does not have admin privileges');
  });

  it('rejects tokens where publicMetadata role is spoofed/missing', async () => {
    vi.mocked(clerkBackend.verifyToken).mockResolvedValueOnce({
      sub: 'user-2',
      publicMetadata: {}, // Role missing or spoofed at client level (not reflected in JWT)
    } as any);
    const req = { headers: { authorization: `Bearer valid.user.token2` } } as any;
    
    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('User does not have admin privileges');
  });

  it('accepts valid cryptographically verified admin Clerk tokens', async () => {
    vi.mocked(clerkBackend.verifyToken).mockResolvedValueOnce({
      sub: 'admin-1',
      publicMetadata: { role: 'admin' },
    } as any);
    const req = { headers: { authorization: `Bearer valid.admin.token` } } as any;
    
    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(true);
    expect(result.userId).toBe('admin-1');
  });
});
