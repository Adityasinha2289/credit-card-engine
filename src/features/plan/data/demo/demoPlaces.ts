import { LocationData } from '../../types';

export const DEMO_ORIGINS: Record<string, LocationData> = {
  'origin_vasant_vihar': { placeId: 'origin_vasant_vihar', name: 'Vasant Vihar', lat: 28.5562, lng: 77.1593, address: 'Delhi, India' },
  'origin_chanakyapuri': { placeId: 'origin_chanakyapuri', name: 'Chanakyapuri', lat: 28.5976, lng: 77.1856, address: 'Delhi, India' },
  'origin_defence_colony': { placeId: 'origin_defence_colony', name: 'Defence Colony', lat: 28.5733, lng: 77.2285, address: 'Delhi, India' },
  'origin_greater_kailash_ii': { placeId: 'origin_greater_kailash_ii', name: 'Greater Kailash II', lat: 28.5330, lng: 77.2427, address: 'Delhi, India' },
  'origin_golf_links': { placeId: 'origin_golf_links', name: 'Golf Links', lat: 28.5950, lng: 77.2307, address: 'Delhi, India' },
};

export const DEMO_DESTINATIONS: Record<string, LocationData> = {
  'destination_goa': { placeId: 'destination_goa', name: 'Goa', lat: 15.2993, lng: 74.1240, address: 'India' },
  'destination_udaipur': { placeId: 'destination_udaipur', name: 'Udaipur', lat: 24.5854, lng: 73.7125, address: 'Rajasthan, India' },
  'destination_jaipur': { placeId: 'destination_jaipur', name: 'Jaipur', lat: 26.9124, lng: 75.7873, address: 'Rajasthan, India' },
  'destination_mussoorie': { placeId: 'destination_mussoorie', name: 'Mussoorie', lat: 30.4598, lng: 78.0664, address: 'Uttarakhand, India' },
  'destination_manali': { placeId: 'destination_manali', name: 'Manali', lat: 32.2396, lng: 77.1887, address: 'Himachal Pradesh, India' },
};

export const ALL_DEMO_PLACES = { ...DEMO_ORIGINS, ...DEMO_DESTINATIONS };
