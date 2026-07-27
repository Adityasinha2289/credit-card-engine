import { NotificationRepository } from './notificationRepository';
import type { AppNotification } from './types';

export class NotificationEngine {
  private static repo = NotificationRepository.getInstance();

  public static getNotifications(): AppNotification[] {
    return this.repo.getNotifications();
  }

  public static getPriorityNotifications(): AppNotification[] {
    const list = this.getNotifications();
    return [...list].sort((a, b) => {
      const priorityMap: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });
  }

  public static getUnread(): AppNotification[] {
    return this.getNotifications().filter((n) => n.status === 'unread');
  }

  public static getHighestPriorityAlert(): AppNotification {
    return this.getPriorityNotifications()[0];
  }

  public static getUpcoming(): AppNotification[] {
    const now = new Date();
    return this.getNotifications().filter((n) => new Date(n.scheduledAt) >= now);
  }

  public static markRead(id: string): void {
    this.repo.markAsRead(id);
  }

  public static dismiss(id: string): void {
    this.repo.dismissNotification(id);
  }
}

/**
 * React hook wrapper for consuming Notification Engine
 */
export function useNotificationEngine() {
  const notifications = NotificationEngine.getNotifications();
  const unreadNotifications = NotificationEngine.getUnread();
  const highestPriorityAlert = NotificationEngine.getHighestPriorityAlert();

  return {
    notifications,
    unreadNotifications,
    highestPriorityAlert,
    markRead: NotificationEngine.markRead,
    dismiss: NotificationEngine.dismiss,
  };
}
