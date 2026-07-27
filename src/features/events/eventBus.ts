import { EventRepository } from './eventRepository';
import { AnalyticsAdapter } from './analyticsAdapter';
import { AuditAdapter, DebugLoggerAdapter } from './auditAdapter';
import type { DomainEvent, EventHandler, Subscription } from './types';

export class EventBus {
  private static instance: EventBus;
  private repo = EventRepository.getInstance();
  private subscriptions: Map<string, Subscription[]> = new Map();
  private subscriptionIdCounter = 0;

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
      EventBus.instance.initBuiltInAdapters();
    }
    return EventBus.instance;
  }

  private initBuiltInAdapters(): void {
    this.subscribe('*', (event) => {
      AnalyticsAdapter.handleEvent(event);
      AuditAdapter.handleEvent(event);
      DebugLoggerAdapter.handleEvent(event);
    });
  }

  public publish<T = Record<string, unknown>>(
    eventName: string,
    source: string,
    category: string,
    payload: T,
    options?: Partial<DomainEvent<T>>
  ): DomainEvent<T> {
    const event: DomainEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      source,
      category,
      eventName,
      payload,
      userId: options?.userId || 'user-default',
      correlationId: options?.correlationId || `corr-${Date.now()}`,
      sessionId: options?.sessionId || `sess-${Date.now()}`,
      version: options?.version || '1.0.0',
    };

    this.repo.saveEvent(event as unknown as DomainEvent);

    const handlers = this.subscriptions.get(eventName) || [];
    const wildcardHandlers = this.subscriptions.get('*') || [];

    [...handlers, ...wildcardHandlers].forEach((sub) => {
      try {
        sub.handler(event as unknown as DomainEvent);
      } catch (_err) {
        this.repo.pushToDLQ(event as unknown as DomainEvent);
      }
    });

    return event;
  }

  public subscribe(eventName: string, handler: EventHandler): string {
    const subId = `sub-${++this.subscriptionIdCounter}`;
    const sub: Subscription = { id: subId, eventName, handler };

    const current = this.subscriptions.get(eventName) || [];
    this.subscriptions.set(eventName, [...current, sub]);

    return subId;
  }

  public unsubscribe(subscriptionId: string): void {
    this.subscriptions.forEach((subs, key) => {
      this.subscriptions.set(
        key,
        subs.filter((s) => s.id !== subscriptionId)
      );
    });
  }

  public replay(filter?: { source?: string; eventName?: string }): DomainEvent[] {
    let history = this.repo.getEvents();
    if (filter?.source) {
      history = history.filter((e) => e.source === filter.source);
    }
    if (filter?.eventName) {
      history = history.filter((e) => e.eventName === filter.eventName);
    }
    return history;
  }

  public getHistory(): DomainEvent[] {
    return this.repo.getEvents();
  }
}

/**
 * React hook wrapper for Event Bus
 */
export function useEventBus() {
  const bus = EventBus.getInstance();

  return {
    publish: bus.publish.bind(bus),
    subscribe: bus.subscribe.bind(bus),
    unsubscribe: bus.unsubscribe.bind(bus),
    replay: bus.replay.bind(bus),
    getHistory: bus.getHistory.bind(bus),
  };
}
