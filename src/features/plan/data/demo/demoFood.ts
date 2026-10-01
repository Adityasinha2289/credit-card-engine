import { FoodSuggestion } from '../../types';
import { DEMO_DESTINATIONS } from './demoPlaces';

export const DEMO_FOOD: Record<string, FoodSuggestion[]> = {};

const dests = Object.keys(DEMO_DESTINATIONS);

dests.forEach(d => {
  const destName = DEMO_DESTINATIONS[d].name;
  
  DEMO_FOOD[d] = [
    {
      id: `food1_${d}`,
      provider: 'Demo Food',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} Fine Dining - Demo`,
      cuisine: 'International',
      priceLevel: '₹₹₹',
      rating: 4.8
    },
    {
      id: `food2_${d}`,
      provider: 'Demo Food',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `Local Bites ${destName} - Demo`,
      cuisine: 'Local/Street',
      priceLevel: '₹',
      rating: 4.5
    },
    {
      id: `food3_${d}`,
      provider: 'Demo Food',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} Cafe - Demo`,
      cuisine: 'Cafe',
      priceLevel: '₹₹',
      rating: 4.2
    },
    {
      id: `food4_${d}`,
      provider: 'Demo Food',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `Spice of ${destName} - Demo`,
      cuisine: 'Indian',
      priceLevel: '₹₹',
      rating: 4.6
    },
    {
      id: `food5_${d}`,
      provider: 'Demo Food',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `${destName} Pizzeria - Demo`,
      cuisine: 'Italian',
      priceLevel: '₹₹',
      rating: 4.3
    },
    {
      id: `food6_${d}`,
      provider: 'Demo Food',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      name: `Healthy Greens ${destName} - Demo`,
      cuisine: 'Healthy',
      priceLevel: '₹₹',
      rating: 4.7
    }
  ];
});

export const getDemoFood = (destId: string): FoodSuggestion[] => {
  return DEMO_FOOD[destId] || DEMO_FOOD['destination_goa'];
};
