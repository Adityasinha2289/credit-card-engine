import { 
  TransportOption, 
  StayOption, 
  ActivityOption, 
  FoodSuggestion,
  LocationData
} from '../types';

export interface RouteRequest {
  origin: LocationData;
  destination: LocationData;
  mode: 'DRIVE' | 'TRANSIT' | 'WALK';
}

export interface RouteResponse {
  distanceKm: number;
  durationMinutes: number;
  tollCostEstimate?: number;
}

export interface TransportSearchRequest {
  origin: LocationData;
  destination: LocationData;
  date: string;
  travelers: number;
}

export interface StaySearchRequest {
  destination: LocationData;
  checkIn: string;
  checkOut: string;
  travelers: number;
  preference: string;
}

export interface PlaceProvider {
  searchPlaces(query: string): Promise<LocationData[]>;
  getPlaceDetails(placeId: string): Promise<LocationData>;
}

export interface RouteProvider {
  getRoute(request: RouteRequest): Promise<RouteResponse>;
}

export interface FlightProvider {
  searchFlights(request: TransportSearchRequest): Promise<TransportOption[]>;
}

export interface RailProvider {
  searchTrains(request: TransportSearchRequest): Promise<TransportOption[]>;
}

export interface BusProvider {
  searchBuses(request: TransportSearchRequest): Promise<TransportOption[]>;
}

export interface HotelProvider {
  searchHotels(request: StaySearchRequest): Promise<StayOption[]>;
}

export interface ActivityProvider {
  searchActivities(destination: LocationData): Promise<ActivityOption[]>;
}

export interface FoodProvider {
  searchFood(destination: LocationData): Promise<FoodSuggestion[]>;
}

export interface MovieProvider {
  searchMovies(destination: LocationData): Promise<any[]>;
}

export interface LocalTransportProvider {
  searchCabs(destination: LocationData): Promise<TransportOption[]>;
}

export interface PartnerOfferProvider {
  getApplicableOffers(merchantContext: string): Promise<any[]>;
}
