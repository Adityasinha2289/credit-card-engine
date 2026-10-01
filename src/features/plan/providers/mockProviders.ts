import { LocationData, TransportOption } from '../types';
import { PlaceProvider } from './interfaces';

// Simple mock for places
export class MockPlaceProvider implements PlaceProvider {
  private MOCK_PLACES: Record<string, LocationData> = {
    'delhi': { placeId: 'delhi', name: 'Delhi', lat: 28.6139, lng: 77.2090, address: 'Delhi, India' },
    'delhi_station': { placeId: 'delhi_station', name: 'New Delhi Railway Station', lat: 28.6429, lng: 77.2191, address: 'New Delhi, Delhi' },
    'mussoorie': { placeId: 'mussoorie', name: 'Mussoorie', lat: 30.4598, lng: 78.0664, address: 'Mussoorie, Uttarakhand' },
    'dehradun': { placeId: 'dehradun', name: 'Dehradun', lat: 30.3165, lng: 78.0322, address: 'Dehradun, Uttarakhand' },
  };

  async searchPlaces(query: string): Promise<LocationData[]> {
    await new Promise(r => setTimeout(r, 500));
    const q = query.toLowerCase();
    return Object.values(this.MOCK_PLACES).filter(p => 
      p.name.toLowerCase().includes(q) || (p.address && p.address.toLowerCase().includes(q))
    );
  }

  async getPlaceDetails(placeId: string): Promise<LocationData> {
    await new Promise(r => setTimeout(r, 200));
    const place = this.MOCK_PLACES[placeId];
    if (!place) throw new Error("Place not found");
    return place;
  }
}

import { 
  RouteProvider, 
  FlightProvider,
  RailProvider,
  RouteRequest, 
  RouteResponse, 
  TransportSearchRequest 
} from './interfaces';
import { getDemoRoute } from '../data/demo/demoRoutes';
import { getDemoFlights, getDemoTrains, getDemoCabs, getDemoLocalCabs } from '../data/demo/demoTransports';
import { getDemoActivities } from '../data/demo/demoActivities';
import { getDemoFood } from '../data/demo/demoFood';
import { getDemoMovies } from '../data/demo/demoMovies';
import { getDemoOffers } from '../data/demo/demoOffers';
import { ActivityProvider, FoodProvider, MovieProvider, LocalTransportProvider, PartnerOfferProvider } from './interfaces';

export class MockRouteProvider implements RouteProvider {
  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    await new Promise(r => setTimeout(r, 800));
    return getDemoRoute(request.origin.placeId, request.destination.placeId);
  }
}

export class MockRailProvider implements RailProvider {
  async searchTrains(request: TransportSearchRequest): Promise<TransportOption[]> {
    await new Promise(r => setTimeout(r, 1200));
    return getDemoTrains(request.destination.placeId);
  }
}

export class MockFlightProvider implements FlightProvider {
  async searchFlights(request: TransportSearchRequest): Promise<TransportOption[]> {
    await new Promise(r => setTimeout(r, 1500));
    return getDemoFlights(request.destination.placeId);
  }
}

export class MockActivityProvider implements ActivityProvider {
  async searchActivities(destination: LocationData) {
    await new Promise(r => setTimeout(r, 800));
    return getDemoActivities(destination.placeId);
  }
}

export class MockFoodProvider implements FoodProvider {
  async searchFood(destination: LocationData) {
    await new Promise(r => setTimeout(r, 800));
    return getDemoFood(destination.placeId);
  }
}

export class MockMovieProvider implements MovieProvider {
  async searchMovies(destination: LocationData) {
    await new Promise(r => setTimeout(r, 800));
    return getDemoMovies();
  }
}

export class MockLocalTransportProvider implements LocalTransportProvider {
  async searchCabs(destination: LocationData) {
    await new Promise(r => setTimeout(r, 800));
    return getDemoLocalCabs(destination.placeId);
  }
}

export class MockPartnerOfferProvider implements PartnerOfferProvider {
  async getApplicableOffers(merchantContext: string) {
    await new Promise(r => setTimeout(r, 500));
    // Simulated user cards context - realistically pulled from user profile
    return getDemoOffers(['HDFC Diners Club Black', 'SBI Cashback']);
  }
}
