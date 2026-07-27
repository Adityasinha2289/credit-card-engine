export interface AuthVerificationResult {
  authenticated: boolean;
  userId?: string;
}

export interface AuthHook {
  verifyToken(authHeader?: string): Promise<AuthVerificationResult>;
}

export class MockClerkAuth implements AuthHook {
  public async verifyToken(authHeader?: string): Promise<AuthVerificationResult> {
    if (!authHeader) {
      return { authenticated: true, userId: 'anon-user' };
    }
    return { authenticated: true, userId: 'user-clerk-verified' };
  }
}
