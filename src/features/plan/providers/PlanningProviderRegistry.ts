import { useIsDemo } from '../../demo/DemoAppProvider';
import { DemoPlaceProvider } from './DemoPlaceProvider';
import { RealPlaceProvider } from './RealPlaceProvider';
import { RealRouteProvider } from './RealRouteProvider';
import { MockHotelProvider } from './mockHotelProvider';
import { 
  MockRailProvider, MockFlightProvider, MockRouteProvider, 
  MockActivityProvider, MockFoodProvider, MockMovieProvider, 
  MockLocalTransportProvider, MockPartnerOfferProvider 
} from './mockProviders';

// Real Providers (to be implemented/stubbed)
export class RealHotelProvider {
  constructor(private getToken: () => Promise<string | null>) {}
  async searchHotels(params: any) {
    throw new Error("HOTELS UNAVAILABLE: Missing provider credentials.");
  }
}

export class RealFlightProvider {
  constructor(private getToken: () => Promise<string | null>) {}
  async searchFlights(params: any) {
    throw new Error("FLIGHTS UNAVAILABLE: Missing provider credentials.");
  }
}

export class RealRailProvider {
  constructor(private getToken: () => Promise<string | null>) {}
  async searchTrains(params: any) {
    throw new Error("RAIL UNAVAILABLE: Missing provider credentials.");
  }
}

export class RealActivityProvider {
  constructor(private getToken: () => Promise<string | null>) {}
  async searchActivities(params: any) {
    throw new Error("ACTIVITIES UNAVAILABLE: Missing provider credentials.");
  }
}

export class RealFoodProvider {
  constructor(private getToken: () => Promise<string | null>) {}
  async searchFood(params: any) {
    throw new Error("FOOD UNAVAILABLE: Missing provider credentials.");
  }
}

export class RealMovieProvider {
  constructor(private getToken: () => Promise<string | null>) {}
  async searchMovies(params: any) {
    throw new Error("MOVIES UNAVAILABLE: Missing provider credentials.");
  }
}

export class RealLocalTransportProvider {
  constructor(private getToken: () => Promise<string | null>) {}
  async searchCabs(params: any) {
    throw new Error("CABS UNAVAILABLE: Missing provider credentials.");
  }
}

export class RealPartnerOfferProvider {
  constructor(private getToken: () => Promise<string | null>) {}
  async getApplicableOffers(merchantContext: string) {
    throw new Error("OFFERS UNAVAILABLE: Missing provider credentials.");
  }
}

// Wrapper to log provider interactions
function withLogging<T extends Record<string, any>>(providerName: string, provider: T): T {
  const handler = {
    get(target: T, propKey: string, receiver: any) {
      const origMethod = target[propKey];
      if (typeof origMethod === 'function') {
        return async function (...args: any[]) {
          try {
            console.log(`[PROVIDER REQUEST] ${providerName}.${propKey}`);
            const result = await origMethod.apply(this, args);
            const count = Array.isArray(result) ? result.length : (result ? 1 : 0);
            console.log(`[PROVIDER SUCCESS] ${providerName}.${propKey} - fetchedAt: ${new Date().toISOString()} - normalized result count: ${count}`);
            return result;
          } catch (err: any) {
            console.error(`[PROVIDER FAILURE] ${providerName}.${propKey} - status: ERROR - reason: ${err.message || 'Unknown'} - fetchedAt: ${new Date().toISOString()}`);
            throw err; // bubble up to be caught by the engine UI
          }
        };
      }
      return Reflect.get(target, propKey, receiver);
    }
  };
  return new Proxy(provider, handler);
}

export class PlanningProviderRegistry {
  private isDemo: boolean;
  private getToken: () => Promise<string | null>;

  constructor(isDemo: boolean, getToken: () => Promise<string | null>) {
    this.isDemo = isDemo;
    this.getToken = getToken;
  }

  getPlaceProvider() {
    const hasKeys = import.meta.env.VITE_MAPBOX_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const provider = (this.isDemo || !hasKeys) ? new DemoPlaceProvider() : new RealPlaceProvider();
    return withLogging('PlaceProvider', provider);
  }

  getRouteProvider() {
    const hasKeys = import.meta.env.VITE_MAPBOX_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const provider = (this.isDemo || !hasKeys) ? new MockRouteProvider() : new RealRouteProvider();
    return withLogging('RouteProvider', provider);
  }

  getHotelProvider() {
    // Real provider not implemented yet, fallback to mock
    const provider = new MockHotelProvider();
    return withLogging('HotelProvider', provider);
  }

  getFlightProvider() {
    // Real provider not implemented yet, fallback to mock
    const provider = new MockFlightProvider();
    return withLogging('FlightProvider', provider);
  }

  getRailProvider() {
    // Real provider not implemented yet, fallback to mock
    const provider = new MockRailProvider(); 
    return withLogging('RailProvider', provider);
  }

  getActivityProvider() {
    // Real provider not implemented yet, fallback to mock
    const provider = new MockActivityProvider();
    return withLogging('ActivityProvider', provider);
  }

  getFoodProvider() {
    // Real provider not implemented yet, fallback to mock
    const provider = new MockFoodProvider();
    return withLogging('FoodProvider', provider);
  }

  getMovieProvider() {
    // Real provider not implemented yet, fallback to mock
    const provider = new MockMovieProvider();
    return withLogging('MovieProvider', provider);
  }

  getLocalTransportProvider() {
    // Real provider not implemented yet, fallback to mock
    const provider = new MockLocalTransportProvider();
    return withLogging('LocalTransportProvider', provider);
  }

  getPartnerOfferProvider() {
    // Real provider not implemented yet, fallback to mock
    const provider = new MockPartnerOfferProvider();
    return withLogging('PartnerOfferProvider', provider);
  }
}

import { useAuth } from '@clerk/clerk-react';

export const usePlanningProviderRegistry = () => {
  const isDemo = useIsDemo();
  const { getToken } = useAuth();
  return new PlanningProviderRegistry(isDemo, getToken);
};
