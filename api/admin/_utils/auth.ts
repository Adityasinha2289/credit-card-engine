import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { authorizedParties } from '../../../src/features/recommendation/api/auth.js';

export interface AdminAuthResult {
  authorized: boolean;
  error?: string;
  userId?: string;
}

// Short cache so an admin page making several calls doesn't hit Clerk each time,
// while a revoked role stops working within a minute.
const ROLE_TTL_MS = 60_000;
const roleCache = new Map<string, { role: string | null; at: number }>();

async function roleFromClerk(userId: string, secretKey: string): Promise<string | null> {
  const hit = roleCache.get(userId);
  if (hit && Date.now() - hit.at < ROLE_TTL_MS) return hit.role;
  const user = await createClerkClient({ secretKey }).users.getUser(userId);
  const role = (user.publicMetadata as Record<string, unknown> | undefined)?.role;
  const value = typeof role === 'string' ? role : null;
  roleCache.set(userId, { role: value, at: Date.now() });
  return value;
}

/**
 * Admin = Clerk user whose server-controlled publicMetadata.role is "admin".
 *
 * If the session token template includes publicMetadata we use it (it is
 * signed and only writable from the Clerk backend). Clerk's default session
 * token doesn't carry it, so otherwise we read it from the Clerk API. Any
 * other claim (e.g. a top-level `role`) is never trusted.
 */
export async function verifyAdminAuthorization(req: VercelRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error('CLERK_SECRET_KEY is missing. Cryptographic verification cannot proceed.');
    return { authorized: false, error: 'Server configuration error' };
  }

  let claims: Record<string, any>;
  try {
    claims = await verifyToken(token, { secretKey, authorizedParties: authorizedParties() }) as Record<string, any>;
  } catch (err: any) {
    console.error('Failed to verify admin token:', err?.message || err);
    return { authorized: false, error: 'Invalid or expired token' };
  }

  try {
    const role = claims.publicMetadata !== undefined
      ? claims.publicMetadata?.role
      : await roleFromClerk(claims.sub, secretKey);
    if (role === 'admin') return { authorized: true, userId: claims.sub };
    return { authorized: false, error: 'User does not have admin privileges' };
  } catch (err: any) {
    console.error('Failed to load admin role:', err?.message || err);
    return { authorized: false, error: 'Could not verify admin role' };
  }
}

export function requireAdmin(handler: (req: VercelRequest, res: VercelResponse, userId: string) => Promise<any>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const authResult = await verifyAdminAuthorization(req);

    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        error: authResult.error || 'Forbidden'
      });
    }

    try {
      await handler(req, res, authResult.userId!);
    } catch (err: any) {
      console.error('Admin API Error:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v);

/** Copy only allow-listed fields (prevents writing ids, timestamps or private columns). */
export function pick<T extends Record<string, unknown>>(body: unknown, fields: readonly string[]): Partial<T> {
  const src = (body && typeof body === 'object') ? body as Record<string, unknown> : {};
  const out: Record<string, unknown> = {};
  for (const f of fields) if (f in src) out[f] = src[f];
  return out as Partial<T>;
}
