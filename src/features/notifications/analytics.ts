export type NotificationAnalyticsEvent =
  | 'notification_viewed'
  | 'notification_clicked'
  | 'notification_dismissed'
  | 'notification_completed';

export interface NotificationAnalyticsPayload {
  eventId: string;
  eventName: NotificationAnalyticsEvent;
  notificationId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class NotificationAnalytics {
  public static trackEvent(eventName: NotificationAnalyticsEvent, notificationId: string, metadata?: Record<string, unknown>): NotificationAnalyticsPayload {
    return {
      eventId: `notif-evt-${Date.now()}`,
      eventName,
      notificationId,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }
}
