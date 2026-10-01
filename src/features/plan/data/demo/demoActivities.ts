import { ActivityOption } from '../../types';
import { DEMO_DESTINATIONS } from './demoPlaces';

export const DEMO_ACTIVITIES: Record<string, ActivityOption[]> = {};

const dests = Object.keys(DEMO_DESTINATIONS);

dests.forEach(d => {
  const destName = DEMO_DESTINATIONS[d].name;
  
  DEMO_ACTIVITIES[d] = [
    {
      id: `act1_${d}`,
      provider: 'Demo Activities',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} City Tour - Demo`,
      category: 'sightseeing',
      distanceKm: 5,
      estimatedTravelTimeMinutes: 20,
      estimatedTransportCost: 200,
      durationMinutes: 180,
      entryCost: 500
    },
    {
      id: `act2_${d}`,
      provider: 'Demo Activities',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} Nature Walk - Demo`,
      category: 'nature',
      distanceKm: 12,
      estimatedTravelTimeMinutes: 40,
      estimatedTransportCost: 400,
      durationMinutes: 120,
      entryCost: 0
    },
    {
      id: `act3_${d}`,
      provider: 'Demo Activities',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} Local Market - Demo`,
      category: 'shopping',
      distanceKm: 2,
      estimatedTravelTimeMinutes: 10,
      estimatedTransportCost: 100,
      durationMinutes: 90,
      entryCost: 0
    },
    {
      id: `act4_${d}`,
      provider: 'Demo Activities',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} Adventure Park - Demo`,
      category: 'adventure',
      distanceKm: 15,
      estimatedTravelTimeMinutes: 45,
      estimatedTransportCost: 600,
      durationMinutes: 240,
      entryCost: 1500
    },
    {
      id: `act5_${d}`,
      provider: 'Demo Activities',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} Museum - Demo`,
      category: 'culture',
      distanceKm: 3,
      estimatedTravelTimeMinutes: 15,
      estimatedTransportCost: 150,
      durationMinutes: 120,
      entryCost: 200
    },
    {
      id: `act6_${d}`,
      provider: 'Demo Activities',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} Spa Retreat - Demo`,
      category: 'relaxation',
      distanceKm: 8,
      estimatedTravelTimeMinutes: 25,
      estimatedTransportCost: 300,
      durationMinutes: 90,
      entryCost: 2500
    }
  ];
});

export const getDemoActivities = (destId: string): ActivityOption[] => {
  return DEMO_ACTIVITIES[destId] || DEMO_ACTIVITIES['destination_goa'];
};
