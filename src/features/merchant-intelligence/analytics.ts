export type MerchantAnalyticsEvent =
  | 'offer_viewed'
  | 'offer_clicked'
  | 'offer_saved'
  | 'offer_redeemed';

export interface MerchantAnalyticsPayload {
  eventId: string;
  eventName: MerchantAnalyticsEvent;
  offerId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class MerchantAnalytics {
  public static trackEvent(eventName: MerchantAnalyticsEvent, offerId: string, metadata?: Record<string, unknown>): MerchantAnalyticsPayload {
    return {
      eventId: `merch-evt-${Date.now()}`,
      eventName,
      offerId,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }
}
