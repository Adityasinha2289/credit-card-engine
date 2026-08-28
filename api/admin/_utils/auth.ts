// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';

export interface AdminAuthResult {
  authorized: boolean;
  error?: string;
  userId?: string;
}

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

  try {
    // Cryptographically verify the signature, issuer, and expiration
    const verifiedClaims = await verifyToken(token, {
      secretKey: secretKey,
    });

    const role = verifiedClaims.publicMetadata?.role || verifiedClaims.role;

    if (role === 'admin') {
      return { authorized: true, userId: verifiedClaims.sub };
    } else {
      return { authorized: false, error: 'User does not have admin privileges' };
    }
  } catch (err: any) {
    console.error('Failed to verify admin token:', err.message || err);
    return { authorized: false, error: 'Invalid or expired token' };
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
