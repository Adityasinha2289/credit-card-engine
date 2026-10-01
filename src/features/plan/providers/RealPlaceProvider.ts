import { PlaceProvider } from './interfaces';
import { LocationData } from '../types';

export class RealPlaceProvider implements PlaceProvider {
  // Placeholder for real API implementation (e.g., Google Maps / Mapbox)
  
  async searchPlaces(query: string): Promise<LocationData[]> {
    if (!import.meta.env.VITE_MAPBOX_API_KEY && !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      throw new Error('Real place search is not configured yet. Set up Mapbox or Google Maps.');
    }
    
    // Fail gracefully as no real provider is actually implemented yet.
    throw new Error('Real place search is not configured yet. Set up Mapbox or Google Maps.');
  }

  async getPlaceDetails(placeId: string): Promise<LocationData> {
    if (!import.meta.env.VITE_MAPBOX_API_KEY && !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      throw new Error('Real place details not configured yet.');
    }
    throw new Error('Real place details not configured yet.');
  }
}
