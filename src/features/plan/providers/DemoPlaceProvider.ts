import { PlaceProvider } from './interfaces';
import { LocationData } from '../types';
import { ALL_DEMO_PLACES } from '../data/demo/demoPlaces';

export class DemoPlaceProvider implements PlaceProvider {
  async searchPlaces(query: string): Promise<LocationData[]> {
    // Deterministic network delay to simulate a real search
    await new Promise(r => setTimeout(r, 150));
    
    if (!query || query.trim().length < 2) return [];

    const q = query.toLowerCase().trim();
    const places = Object.values(ALL_DEMO_PLACES);
    
    // Prefix matches first, then substring
    const prefixMatches = places.filter(p => p.name.toLowerCase().startsWith(q));
    const substringMatches = places.filter(p => !p.name.toLowerCase().startsWith(q) && p.name.toLowerCase().includes(q));
    
    return [...prefixMatches, ...substringMatches].slice(0, 8);
  }

  async getPlaceDetails(placeId: string): Promise<LocationData> {
    await new Promise(r => setTimeout(r, 100));
    const place = ALL_DEMO_PLACES[placeId];
    if (!place) throw new Error("Demo place not found");
    return place;
  }
}
