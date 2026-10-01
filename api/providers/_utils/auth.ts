import { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';

export interface AuthResult {
  authorized: boolean;
  error?: string;
  userId?: string;
}

export async function verifyAuthorization(req: VercelRequest): Promise<AuthResult> {
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
    const verifiedClaims = await verifyToken(token, { secretKey });
    return { authorized: true, userId: verifiedClaims.sub };
  } catch (err: any) {
    console.error('Failed to verify token:', err.message || err);
    return { authorized: false, error: 'Invalid or expired token' };
  }
}

export function requireAuth(handler: (req: VercelRequest, res: VercelResponse, userId: string) => Promise<any>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const authResult = await verifyAuthorization(req);
    
    if (!authResult.authorized) {
      return res.status(401).json({
        success: false,
        error: authResult.error || 'Unauthorized'
      });
    }

    try {
      await handler(req, res, authResult.userId!);
    } catch (err: any) {
      console.error('API Error:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
}
