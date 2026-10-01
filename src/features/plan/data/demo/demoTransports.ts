import { TransportOption } from '../../types';
import { DEMO_DESTINATIONS } from './demoPlaces';

const createFlight = (id: string, carrier: string, dep: string, arr: string, price: number, destId: string): TransportOption => ({
  id,
  provider: 'Demo Air',
  source: 'DEMO',
  fetchedAt: new Date().toISOString(),
  service: carrier,
  flightOrTrainNumber: `DEMO-${id.split('_')[1]}`,
  departureTime: dep,
  arrivalTime: arr,
  durationMinutes: 120,
  stops: 0,
  price,
  currency: 'INR',
  availabilityStatus: 'AVAILABLE'
});

const createTrain = (id: string, name: string, dep: string, arr: string, price: number, destId: string): TransportOption => ({
  id,
  provider: 'Demo Rail',
  source: 'DEMO',
  fetchedAt: new Date().toISOString(),
  service: name,
  flightOrTrainNumber: `TR-${id.split('_')[1]}`,
  departureTime: dep,
  arrivalTime: arr,
  durationMinutes: 360,
  stops: 0,
  price,
  currency: 'INR',
  availabilityStatus: 'AVAILABLE'
});

const createCab = (id: string, type: string, price: number, destId: string): TransportOption => ({
  id,
  provider: 'Demo Cab',
  source: 'DEMO',
  fetchedAt: new Date().toISOString(),
  service: type,
  departureTime: '10:00',
  arrivalTime: '14:00',
  durationMinutes: 240,
  stops: 0,
  price,
  currency: 'INR',
  availabilityStatus: 'AVAILABLE'
});

export const getDemoFlights = (destId: string): TransportOption[] => {
  return [
    createFlight(`f1_${destId}`, 'Demo Air Value', '06:00', '08:00', 3500, destId),
    createFlight(`f2_${destId}`, 'Demo Air Balanced', '10:00', '12:00', 5000, destId),
    createFlight(`f3_${destId}`, 'Demo Air Comfort', '14:00', '16:00', 8500, destId),
  ];
};

export const getDemoTrains = (destId: string): TransportOption[] => {
  return [
    createTrain(`t1_${destId}`, 'Demo Express', '07:00', '13:00', 800, destId),
    createTrain(`t2_${destId}`, 'Demo Shatabdi', '15:00', '21:00', 1500, destId),
    createTrain(`t3_${destId}`, 'Demo Vande', '18:00', '23:00', 2500, destId),
  ];
};

export const getDemoCabs = (destId: string): TransportOption[] => {
  return [
    createCab(`c1_${destId}`, 'Economy Sedan', 2000, destId),
    createCab(`c2_${destId}`, 'Premium SUV', 4500, destId),
  ];
};

export const getDemoLocalCabs = (destId: string) => {
  return [
    {
      id: `lc1_${destId}`,
      type: 'Local Cab',
      provider: 'Demo Cabs',
      vehicle: 'Economy Sedan',
      estimatedDuration: 30,
      estimatedDistance: 15,
      estimatedPrice: 400,
      currency: 'INR',
      source: 'DEMO',
      status: 'DEMO'
    },
    {
      id: `lc2_${destId}`,
      type: 'Airport Cab',
      provider: 'Demo Cabs',
      vehicle: 'Premium SUV',
      estimatedDuration: 45,
      estimatedDistance: 25,
      estimatedPrice: 1200,
      currency: 'INR',
      source: 'DEMO',
      status: 'DEMO'
    }
  ];
}
