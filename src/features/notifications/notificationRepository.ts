import type { AppNotification, NotificationDataSource } from './types';
import { MOCK_NOTIFICATIONS } from './mockNotifications';

export class NotificationRepository implements NotificationDataSource {
  private static instance: NotificationRepository;
  private notifications: AppNotification[] = MOCK_NOTIFICATIONS;

  public static getInstance(): NotificationRepository {
    if (!NotificationRepository.instance) {
      NotificationRepository.instance = new NotificationRepository();
    }
    return NotificationRepository.instance;
  }

  public getNotifications(): AppNotification[] {
    return this.notifications.filter((n) => n.status !== 'dismissed');
  }

  public markAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.status = 'read';
  }

  public dismissNotification(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.status = 'dismissed';
  }
}
