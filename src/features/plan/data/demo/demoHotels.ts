import { StayOption } from '../../types';
import { DEMO_DESTINATIONS } from './demoPlaces';

export const DEMO_HOTELS: Record<string, StayOption[]> = {};

const dests = Object.keys(DEMO_DESTINATIONS);

dests.forEach(d => {
  const destName = DEMO_DESTINATIONS[d].name;
  
  DEMO_HOTELS[d] = [
    {
      id: `h1_${d}`,
      provider: 'Demo Hotels',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      hotelName: `${destName} Budget Inn - Demo`,
      stars: 2,
      locationContext: 'City Outskirts',
      roomType: 'Standard Room',
      nightlyPrice: 2000,
      totalStayPrice: 2000,
      taxAndFees: 300,
      availability: true,
      rating: 3.5,
      rankingReason: 'BEST VALUE'
    },
    {
      id: `h2_${d}`,
      provider: 'Demo Hotels',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      hotelName: `Casa ${destName} - Demo`,
      stars: 3,
      locationContext: 'Central Area',
      roomType: 'Deluxe Room',
      nightlyPrice: 4000,
      totalStayPrice: 4000,
      taxAndFees: 600,
      availability: true,
      rating: 4.0,
      rankingReason: 'GOOD MATCH'
    },
    {
      id: `h3_${d}`,
      provider: 'Demo Hotels',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      hotelName: `The ${destName} Retreat - Demo`,
      stars: 4,
      locationContext: 'Scenic View',
      roomType: 'Premium Suite',
      nightlyPrice: 7500,
      totalStayPrice: 7500,
      taxAndFees: 1200,
      availability: true,
      rating: 4.5,
      rankingReason: 'GOOD MATCH'
    },
    {
      id: `h4_${d}`,
      provider: 'Demo Hotels',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      hotelName: `Royal ${destName} Palace - Demo`,
      stars: 5,
      locationContext: 'Prime Location',
      roomType: 'Luxury Villa',
      nightlyPrice: 15000,
      totalStayPrice: 15000,
      taxAndFees: 2500,
      availability: true,
      rating: 4.8,
      rankingReason: 'UPGRADE PICK'
    },
    {
      id: `h5_${d}`,
      provider: 'Demo Hotels',
      source: 'DEMO',
      fetchedAt: new Date().toISOString(),
      hotelName: `${destName} Backpacker Hostel - Demo`,
      stars: 1,
      locationContext: 'Downtown',
      roomType: 'Dorm Bed',
      nightlyPrice: 800,
      totalStayPrice: 800,
      taxAndFees: 100,
      availability: true,
      rating: 4.1,
      rankingReason: 'BEST VALUE'
    }
  ];
});

export const getDemoHotels = (destId: string): StayOption[] => {
  return DEMO_HOTELS[destId] || DEMO_HOTELS['destination_goa'];
};
