import type { DomainEvent } from './types';

export class AnalyticsAdapter {
  public static handleEvent(_event: DomainEvent): void {
    // Placeholder analytics channel handler (e.g. PostHog, Mixpanel, Segment)
    // Logs formatted domain event to internal analytics buffer
  }
}
