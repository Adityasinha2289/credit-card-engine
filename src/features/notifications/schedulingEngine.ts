import type { AppNotification } from './types';

export class SchedulingEngine {
  /**
   * Evaluates timing & triggers for scheduling notifications without delivery execution
   */
  public static scheduleBillReminder(cardName: string, amount: number, daysLeft: number): Omit<AppNotification, 'id'> {
    return {
      type: 'reminder',
      priority: daysLeft <= 3 ? 'urgent' : 'high',
      title: `${cardName} Bill Reminder`,
      message: `₹${amount.toLocaleString('en-IN')} due in ${daysLeft} days. Pay to prevent late fee penalties.`,
      category: 'billing',
      trigger: 'bill_due_date',
      scheduledAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Pay Bill Now',
      sourceEngine: 'financial_health',
      status: 'unread',
    };
  }

  public static scheduleOfferExpiry(offerTitle: string, hoursLeft: number): Omit<AppNotification, 'id'> {
    return {
      type: 'opportunity',
      priority: 'high',
      title: 'Merchant Offer Expiring Soon',
      message: `"${offerTitle}" expires in ${hoursLeft} hours. Don't miss instant cashback.`,
      category: 'offer',
      trigger: 'offer_expiry',
      scheduledAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + hoursLeft * 60 * 60 * 1000).toISOString(),
      action: 'View Offer',
      sourceEngine: 'merchant_intelligence',
      status: 'unread',
    };
  }

  public static scheduleWeeklySummary(totalSavings: number): Omit<AppNotification, 'id'> {
    return {
      type: 'summary',
      priority: 'medium',
      title: 'Weekly Financial Summary',
      message: `You earned ₹${totalSavings.toLocaleString('en-IN')} in savings & cashback rewards this week!`,
      category: 'health',
      trigger: 'weekly_cron',
      scheduledAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'View Impact Ledger',
      sourceEngine: 'financial_ledger',
      status: 'unread',
    };
  }
}
