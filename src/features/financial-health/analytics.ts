export type HealthAnalyticsEvent =
  | 'financial_health_viewed'
  | 'financial_health_improved'
  | 'financial_health_declined'
  | 'score_recalculated';

export interface HealthAnalyticsPayload {
  eventId: string;
  eventName: HealthAnalyticsEvent;
  score: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class FinancialHealthAnalytics {
  public static trackEvent(eventName: HealthAnalyticsEvent, score: number, metadata?: Record<string, unknown>): HealthAnalyticsPayload {
    return {
      eventId: `health-evt-${Date.now()}`,
      eventName,
      score,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }
}
