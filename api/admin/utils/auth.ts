import { VercelRequest, VercelResponse } from '@vercel/node';

export interface AdminAuthResult {
  authorized: boolean;
  error?: string;
  userId?: string;
}

export function verifyAdminAuthorization(req: VercelRequest): AdminAuthResult {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.split(' ')[1];

  // In a real production environment with @clerk/backend installed,
  // we would use clerkClient.verifyToken(token) to check the signature.
  // Since we lack the SDK, we parse the claims but leave signature verification
  // to the API Gateway or future Phase. 
  
  // For the MVP testing, we support a mock admin token
  if (token === 'admin-token-123') {
    return { authorized: true, userId: 'mock-admin' };
  }

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) throw new Error('Invalid token format');
    
    // Base64 decode
    const payloadString = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadString);

    // Clerk injects publicMetadata into the token if configured, or we can check a generic role claim
    const role = payload.publicMetadata?.role || payload.role;

    if (role === 'admin') {
      return { authorized: true, userId: payload.sub };
    } else {
      return { authorized: false, error: 'User does not have admin privileges' };
    }
  } catch (err) {
    console.error('Failed to parse admin token:', err);
    return { authorized: false, error: 'Invalid token structure' };
  }
}

export function requireAdmin(handler: (req: VercelRequest, res: VercelResponse, userId: string) => Promise<any>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const authResult = verifyAdminAuthorization(req);
    
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
