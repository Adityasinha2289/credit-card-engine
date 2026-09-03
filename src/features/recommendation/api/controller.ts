import { RecommendationService } from '../recommendationService';
import { ApiValidator } from './validator';
import { MockRateLimiter, type RateLimiterHook } from './rateLimiter';
import { ClerkAuth, type AuthHook } from './auth';
import type { ApiResponse } from './types';

export class RecommendationApiController {
  private service: RecommendationService;
  private rateLimiter: RateLimiterHook;
  private auth: AuthHook;

  constructor(
    service: RecommendationService = RecommendationService.getInstance(),
    rateLimiter: RateLimiterHook = new MockRateLimiter(),
    auth: AuthHook = new ClerkAuth()
  ) {
    this.service = service;
    this.rateLimiter = rateLimiter;
    this.auth = auth;
  }

  public async handlePostRequest(
    body: unknown,
    authHeader?: string,
    clientIp = '127.0.0.1'
  ): Promise<{ statusCode: number; payload: ApiResponse }> {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Rate Limiting Check
    const rateCheck = await this.rateLimiter.checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return {
        statusCode: 429,
        payload: {
          success: false,
          requestId,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Rate limit exceeded. Please try again later.',
          },
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // 2. Authentication Verification Check
    const authResult = await this.auth.verifyToken(authHeader);
    if (!authResult.authenticated) {
      return {
        statusCode: 401,
        payload: {
          success: false,
          requestId,
          error: {
            code: 'UNAUTHORIZED',
            message: authResult.error || 'Authentication failed',
          },
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // 3. Payload Validation Check
    const validation = ApiValidator.validateRequest(body);
    if (!validation.valid || !validation.data) {
      return {
        statusCode: 400,
        payload: {
          success: false,
          requestId,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Request payload validation failed.',
            details: validation.errors,
          },
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // 4. Recommendation Engine Invocation
    const reqData = validation.data;
    const recommendation = this.service.getRecommendation({
      merchant: reqData.merchant,
      amount: reqData.amount,
      transactionDate: reqData.transactionDate ? new Date(reqData.transactionDate) : undefined,
    });

    const executionTimeMs = Date.now() - startTime;

    return {
      statusCode: 200,
      payload: {
        success: true,
        requestId,
        recommendation: {
          bestCard: recommendation.bestCard,
          expectedReward: recommendation.expectedReward,
          expectedSavings: recommendation.expectedSavings,
        },
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        alternatives: recommendation.alternatives,
        executionTimeMs,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
