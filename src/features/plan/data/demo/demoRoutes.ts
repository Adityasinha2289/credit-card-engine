import { ALL_DEMO_PLACES, DEMO_ORIGINS, DEMO_DESTINATIONS } from './demoPlaces';
import { RouteResponse } from '../../providers/interfaces';

export const DEMO_ROUTES: Record<string, RouteResponse> = {};

const origins = Object.keys(DEMO_ORIGINS);
const destinations = Object.keys(DEMO_DESTINATIONS);

// Deterministic generation
origins.forEach((o, oIdx) => {
  destinations.forEach((d, dIdx) => {
    const key = `${o}_${d}`;
    
    // Pseudo-deterministic values based on index
    const baseDistance = 300 + (oIdx * 100) + (dIdx * 150);
    const baseDuration = (baseDistance / 50) * 60; // 50km/h average

    DEMO_ROUTES[key] = {
      distanceKm: baseDistance,
      durationMinutes: Math.floor(baseDuration),
      tollCostEstimate: Math.floor(baseDistance * 1.5)
    };
  });
});

export const getDemoRoute = (originId: string, destId: string): RouteResponse => {
  return DEMO_ROUTES[`${originId}_${destId}`] || {
    distanceKm: 500,
    durationMinutes: 600,
    tollCostEstimate: 500
  };
};
