export type ProviderState = 'LIVE' | 'DEMO' | 'UNAVAILABLE' | 'ERROR' | 'EMPTY_RESULT';

export interface ProviderStatusModel {
  provider: string;
  mode: ProviderState;
  configured: boolean;
  source: 'CLIENT' | 'SERVER';
  lastVerifiedAt: string;
  errorCode?: string;
}

class ProviderStatusManager {
  private statusCache: Record<string, ProviderStatusModel> = {};

  async verifyAll(isDemo: boolean): Promise<Record<string, ProviderStatusModel>> {
    const timestamp = new Date().toISOString();

    if (isDemo) {
      const demoStatus = (name: string): ProviderStatusModel => ({
        provider: name,
        mode: 'DEMO',
        configured: true,
        source: 'CLIENT',
        lastVerifiedAt: timestamp
      });
      return {
        PLACE: demoStatus('PLACE'),
        ROUTE: demoStatus('ROUTE'),
        HOTEL: demoStatus('HOTEL'),
        FLIGHT: demoStatus('FLIGHT'),
        RAIL: demoStatus('RAIL'),
        ACTIVITY: demoStatus('ACTIVITY'),
        FOOD: demoStatus('FOOD')
      };
    }

    // Client-side checks
    const hasGoogleMaps = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    this.statusCache['PLACE'] = {
      provider: 'PLACE',
      mode: hasGoogleMaps ? 'LIVE' : 'UNAVAILABLE',
      configured: hasGoogleMaps,
      source: 'CLIENT',
      lastVerifiedAt: timestamp
    };
    
    this.statusCache['ROUTE'] = {
      provider: 'ROUTE',
      mode: hasGoogleMaps ? 'LIVE' : 'UNAVAILABLE',
      configured: hasGoogleMaps,
      source: 'CLIENT',
      lastVerifiedAt: timestamp
    };

    // Activity and Food are DEMO ONLY
    this.statusCache['ACTIVITY'] = {
      provider: 'ACTIVITY',
      mode: 'UNAVAILABLE',
      configured: false,
      source: 'CLIENT',
      lastVerifiedAt: timestamp,
      errorCode: 'LIVE ACTIVITY DATA UNAVAILABLE'
    };

    this.statusCache['FOOD'] = {
      provider: 'FOOD',
      mode: 'UNAVAILABLE',
      configured: false,
      source: 'CLIENT',
      lastVerifiedAt: timestamp,
      errorCode: 'LIVE FOOD DATA UNAVAILABLE'
    };

    // Server-side checks
    try {
      const res = await fetch('/api/providers/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const serverData = json.data;
          ['HOTEL', 'FLIGHT', 'RAIL'].forEach(key => {
            this.statusCache[key] = {
              provider: key,
              mode: serverData[key].mode,
              configured: serverData[key].configured,
              source: 'SERVER',
              lastVerifiedAt: timestamp
            };
          });
        }
      }
    } catch (e: any) {
      // If server check fails, assume unavailable
      ['HOTEL', 'FLIGHT', 'RAIL'].forEach(key => {
        this.statusCache[key] = {
          provider: key,
          mode: 'ERROR',
          configured: false,
          source: 'SERVER',
          lastVerifiedAt: timestamp,
          errorCode: e.message
        };
      });
    }

    return this.statusCache;
  }

  getStatus(providerName: string): ProviderStatusModel | undefined {
    return this.statusCache[providerName];
  }
}

export const ProviderStatus = new ProviderStatusManager();
