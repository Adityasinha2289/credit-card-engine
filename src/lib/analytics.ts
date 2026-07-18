import posthog from 'posthog-js';

type EventMap = {
  // Authentication
  'User Signed Up': { method?: string };
  'User Logged In': { method?: string };
  'User Logged Out': undefined;

  // Cards
  'Card Added': { bank: string; network: string; cardName: string };
  'Card Deleted': { bank: string; network: string; cardName: string };
  'Card Viewed': { bank: string; network: string; cardName: string; source?: string };

  // Recommendations
  'Recommendation Generated': { context?: string; resultCount: number };
  'Recommendation Accepted': { bank: string; network: string; cardName: string };
  'Recommendation Dismissed': { bank: string; network: string; cardName: string };

  // AI
  'Taqdeer Chat Started': { source?: string };
  'Prompt Sent': { promptLength: number; hasContext: boolean };
  'Response Generated': { responseLength: number; modelName?: string };

  // Wallet
  'Wallet Optimization Run': { category: string; amount?: number; topCardId?: string };

  // Reports
  'Monthly Report Generated': { month: string; year: number; totalSpend?: number };
  'Report Downloaded': { reportType: string; format: string };

  // System
  'App Opened': { source?: string };
  'Session Started': { sessionId?: string };
  'Feature Used': { featureName: string; tab?: string };
};

class AnalyticsService {
  /**
   * Tracks an event in PostHog with strict typing to prevent PII leakage.
   */
  track<K extends keyof EventMap>(
    eventName: K,
    ...args: EventMap[K] extends undefined ? [] : [properties: EventMap[K]]
  ) {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;
    
    const properties = args[0];
    posthog.capture(eventName, properties);
  }

  /**
   * Identifies the user in PostHog.
   * @param userId The unique user identifier (e.g., Clerk ID)
   * @param traits Non-sensitive user traits
   */
  identify(userId: string, traits?: Record<string, string | number | boolean>) {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;
    posthog.identify(userId, traits);
  }

  /**
   * Resets the PostHog session (useful on logout).
   */
  reset() {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;
    posthog.reset();
  }
}

export const analytics = new AnalyticsService();
