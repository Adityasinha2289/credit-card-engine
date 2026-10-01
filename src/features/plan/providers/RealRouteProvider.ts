import { RouteProvider, RouteRequest, RouteResponse } from './interfaces';

export class RealRouteProvider implements RouteProvider {
  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    if (!import.meta.env.VITE_MAPBOX_API_KEY && !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      throw new Error('Real route provider is not configured yet. Set up Mapbox or Google Maps.');
    }
    
    // Fail gracefully as no real provider is actually implemented yet.
    throw new Error('Real route calculation is not configured yet. Set up Mapbox or Google Maps.');
  }
}
