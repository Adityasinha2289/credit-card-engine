export type FeatureFlagAnalyticsEvent =
  | 'feature_enabled'
  | 'feature_disabled'
  | 'experiment_viewed'
  | 'experiment_converted';

export interface FeatureFlagAnalyticsPayload {
  eventId: string;
  eventName: FeatureFlagAnalyticsEvent;
  flagKeyOrExperimentId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class FeatureFlagAnalytics {
  public static trackEvent(eventName: FeatureFlagAnalyticsEvent, flagKeyOrExperimentId: string, metadata?: Record<string, unknown>): FeatureFlagAnalyticsPayload {
    return {
      eventId: `ff-evt-${Date.now()}`,
      eventName,
      flagKeyOrExperimentId,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }
}
