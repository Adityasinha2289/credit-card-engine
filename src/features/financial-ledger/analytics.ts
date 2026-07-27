export type LedgerAnalyticsEvent =
  | 'ledger_viewed'
  | 'ledger_entry_clicked'
  | 'achievement_unlocked'
  | 'financial_win_viewed';

export interface LedgerAnalyticsPayload {
  eventId: string;
  eventName: LedgerAnalyticsEvent;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class LedgerAnalytics {
  public static trackEvent(eventName: LedgerAnalyticsEvent, metadata?: Record<string, unknown>): LedgerAnalyticsPayload {
    return {
      eventId: `ledger-evt-${Date.now()}`,
      eventName,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }
}
