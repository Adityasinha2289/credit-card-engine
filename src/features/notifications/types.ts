import type { TransactionCategory } from '../dashboard/types/dashboard.types';

export type NotificationType = 'alert' | 'reminder' | 'opportunity' | 'summary';
export type NotificationPriority = 'urgent' | 'high' | 'medium' | 'low';
export type NotificationStatus = 'unread' | 'read' | 'dismissed';
export type SourceEngine =
  | 'taqdeer'
  | 'financial_health'
  | 'merchant_intelligence'
  | 'card_intelligence'
  | 'financial_ledger';

export interface AppNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  category: TransactionCategory | 'billing' | 'health' | 'offer';
  trigger: string;
  scheduledAt: string;
  expiresAt: string;
  action: string;
  sourceEngine: SourceEngine;
  status: NotificationStatus;
}

export type DeliveryChannel = 'push' | 'email' | 'sms' | 'whatsapp' | 'in_app';

export interface QuietHours {
  start: string;
  end: string;
}

export interface NotificationPreferences {
  quietHours: QuietHours;
  channels: Record<DeliveryChannel, boolean>;
  frequencyLimitPerDay: number;
  locale: string;
}

export interface NotificationDataSource {
  getNotifications(): Promise<AppNotification[]> | AppNotification[];
  markAsRead(id: string): void;
  dismissNotification(id: string): void;
}
