import { describe, it, expect } from 'vitest';
import { verifyAdminAuthorization } from '../admin/utils/auth';

describe('Admin Authorization Utilities', () => {
  it('rejects requests without authorization header', () => {
    const req = { headers: {} } as any;
    const result = verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('Missing or invalid Authorization header');
  });

  it('accepts mock admin token', () => {
    const req = { headers: { authorization: 'Bearer admin-token-123' } } as any;
    const result = verifyAdminAuthorization(req);
    expect(result.authorized).toBe(true);
    expect(result.userId).toBe('mock-admin');
  });

  it('rejects malformed tokens', () => {
    const req = { headers: { authorization: 'Bearer bad.token' } } as any;
    const result = verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('Invalid token structure');
  });

  it('rejects non-admin Clerk tokens', () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'user-1', publicMetadata: { role: 'user' } })).toString('base64');
    const token = `header.${payload}.signature`;
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    
    const result = verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('User does not have admin privileges');
  });

  it('accepts valid admin Clerk tokens', () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'admin-1', publicMetadata: { role: 'admin' } })).toString('base64');
    const token = `header.${payload}.signature`;
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    
    const result = verifyAdminAuthorization(req);
    expect(result.authorized).toBe(true);
    expect(result.userId).toBe('admin-1');
  });
});
