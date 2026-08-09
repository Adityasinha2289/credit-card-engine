import type { OptimizationResult } from '../optimization/types';
import { useDashboardStore } from '../dashboard/store/dashboardStore';

export interface OutboundRequest {
  commerceEntityId: string;
  placement: string;
  recommendationSnapshot?: Partial<OptimizationResult>;
}

export class OutboundService {
  /**
   * Tracks the outbound click and redirects the user to the partner.
   * If the API fails, it will attempt a safe fallback if possible, or throw an error.
   */
  static async navigateToPartner(req: OutboundRequest): Promise<void> {
    try {
      // In a real app we'd get the auth token from Clerk here.
      // For this prototype, we'll just send a dummy header if logged in.
      const profile = useDashboardStore.getState().profile;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (profile?.id) {
        headers['Authorization'] = `Bearer mock-token-for-${profile.id}`;
      }

      const response = await fetch('/api/outbound', {
        method: 'POST',
        headers,
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        throw new Error('Failed to generate secure tracking link');
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Invalid tracking link response');
      }
    } catch (err) {
      console.error('Outbound tracking failed:', err);
      // Depending on product requirements, we might show a toast here.
      throw err;
    }
  }
}
