import type { DomainEvent, EventDataSource } from './types';

export class EventRepository implements EventDataSource {
  private static instance: EventRepository;
  private events: DomainEvent[] = [];
  private deadLetterQueue: DomainEvent[] = [];

  public static getInstance(): EventRepository {
    if (!EventRepository.instance) {
      EventRepository.instance = new EventRepository();
    }
    return EventRepository.instance;
  }

  public saveEvent(event: DomainEvent): void {
    this.events.push(event);
  }

  public getEvents(): DomainEvent[] {
    return this.events;
  }

  public pushToDLQ(event: DomainEvent): void {
    this.deadLetterQueue.push(event);
  }

  public getDLQ(): DomainEvent[] {
    return this.deadLetterQueue;
  }
}
