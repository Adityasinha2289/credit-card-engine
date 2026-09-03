import { verifyToken } from '@clerk/backend';

export interface AuthVerificationResult {
  authenticated: boolean;
  userId?: string;
  error?: string;
}

export interface AuthHook {
  verifyToken(authHeader?: string): Promise<AuthVerificationResult>;
}

export class ClerkAuth implements AuthHook {
  public async verifyToken(authHeader?: string): Promise<AuthVerificationResult> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Missing or invalid Authorization header' };
    }
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error('CLERK_SECRET_KEY is missing.');
      return { authenticated: false, error: 'Server configuration error' };
    }

    try {
      const verifiedClaims = await verifyToken(token, { secretKey });
      return { authenticated: true, userId: verifiedClaims.sub };
    } catch (err: any) {
      console.error('Failed to verify clerk token:', err.message || err);
      return { authenticated: false, error: 'Invalid or expired token' };
    }
  }
}
