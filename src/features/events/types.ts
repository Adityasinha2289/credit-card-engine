export interface DomainEvent<T = Record<string, unknown>> {
  id: string;
  timestamp: string;
  source: string;
  category: string;
  eventName: string;
  payload: T;
  userId: string;
  correlationId: string;
  sessionId: string;
  version: string;
}

export type EventHandler<T = Record<string, unknown>> = (event: DomainEvent<T>) => void | Promise<void>;

export interface Subscription {
  id: string;
  eventName: string;
  handler: EventHandler;
}

export interface EventBusQueueOptions {
  batchSize?: number;
  retryAttempts?: number;
  offlineQueueEnabled?: boolean;
}

export interface EventDataSource {
  saveEvent(event: DomainEvent): Promise<void> | void;
  getEvents(): Promise<DomainEvent[]> | DomainEvent[];
}
