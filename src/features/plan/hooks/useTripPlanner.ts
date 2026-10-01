import { useState, useCallback } from 'react';
import type { TripPlanDraft, LocationData, TransportMode, StayPreference, BudgetPreference } from '../types';

export function useTripPlanner() {
  const [draft, setDraft] = useState<TripPlanDraft>({
    origin: null,
    destination: null,
    departureDate: null,
    returnDate: null,
    tripType: 'round-trip',
    travelers: 2,
    transportMode: null,
    stayPreference: null,
    budgetPreference: null,
    activityPreferences: [],
    foodPreference: []
  });

  const updateDraft = useCallback((updates: Partial<TripPlanDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    draft,
    updateDraft
  };
}
