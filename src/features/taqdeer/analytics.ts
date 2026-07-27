import { EventBus } from '../events/eventBus';

export type TaqdeerAnalyticsEvent =
  | 'decision_viewed'
  | 'decision_clicked'
  | 'decision_dismissed'
  | 'decision_completed';

export interface TaqdeerAnalyticsPayload {
  eventId: string;
  eventName: TaqdeerAnalyticsEvent;
  decisionId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class TaqdeerAnalytics {
  public static trackEvent(eventName: TaqdeerAnalyticsEvent, decisionId: string, metadata?: Record<string, unknown>): TaqdeerAnalyticsPayload {
    const domainEvent = EventBus.getInstance().publish(
      eventName,
      'taqdeer',
      'decision',
      { decisionId, ...metadata }
    );

    return {
      eventId: domainEvent.id,
      eventName,
      decisionId,
      timestamp: domainEvent.timestamp,
      metadata,
    };
  }
}
