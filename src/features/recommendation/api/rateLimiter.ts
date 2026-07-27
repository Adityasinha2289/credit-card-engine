export interface RateLimiterHook {
  checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number }>;
}

export class MockRateLimiter implements RateLimiterHook {
  public async checkRateLimit(_key: string): Promise<{ allowed: boolean; remaining: number }> {
    return { allowed: true, remaining: 100 };
  }
}
