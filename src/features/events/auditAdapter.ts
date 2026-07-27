import type { DomainEvent } from './types';

export class AuditAdapter {
  public static handleEvent(_event: DomainEvent): void {
    // Placeholder security and audit log adapter
  }
}

export class DebugLoggerAdapter {
  public static handleEvent(_event: DomainEvent): void {
    // Debug logger adapter for local development tracing
  }
}
