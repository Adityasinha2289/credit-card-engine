import { TripPlanDraft, TransportOption, StayOption, ActivityOption, TripBudget, PartnerOffer } from '../types';

export function calculateBudget(
  draft: TripPlanDraft,
  transport: TransportOption,
  stay: StayOption,
  activities: ActivityOption[],
  offers: PartnerOffer[],
  isDemoMode: boolean = false
): TripBudget {
  const travelers = draft.travelers || 1;
  
  // Calculate total days
  let days = 3; // default for demo if dates are missing
  if (draft.departureDate && draft.returnDate) {
    const start = new Date(draft.departureDate);
    const end = new Date(draft.returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } else if (draft.departureDate) {
    days = 1; // if one-way, default to 1 day for budget logic
  }

  // Transport: Return trip if applicable
  const transportCost = transport.price ? transport.price * travelers * (draft.tripType === 'round-trip' ? 2 : 1) : 0;
  
  // Accommodation
  const accommodationCost = stay.totalStayPrice ? stay.totalStayPrice + stay.taxAndFees : 0;

  // Activities
  const activityCost = activities.reduce((sum, a) => sum + ((a.entryCost || 0) * travelers), 0);

  // Local transport (estimate based on activities)
  const localTransportCost = activities.length * 300; 

  // Food (estimate per person per day)
  const foodCost = 1500 * travelers * days;

  const subTotal = transportCost + accommodationCost + activityCost + localTransportCost + foodCost;
  
  // Buffer (10%)
  const buffer = Math.round(subTotal * 0.1);

  // Offers/Rewards 
  let potentialOfferValue = 0;
  if (isDemoMode) {
    // Very naive reward logic for demo: 10% off hotels via partner, 2% back on transport
    potentialOfferValue = Math.round((accommodationCost * 0.1) + (transportCost * 0.02));
  } else {
    // In production, loop over actual offers if provided (mocked as 0 for now since no real offers integrated yet)
    potentialOfferValue = offers.reduce((sum, offer) => sum + (offer.value || 0), 0);
  }

  const totalBeforeOffers = subTotal + buffer;
  const estimatedTotal = totalBeforeOffers - potentialOfferValue;

  return {
    intercityTransport: transportCost,
    accommodation: accommodationCost,
    localTransport: localTransportCost,
    food: foodCost,
    activities: activityCost,
    buffer,
    totalBeforeOffers,
    potentialOfferValue,
    estimatedTotal,
    perPerson: Math.round(estimatedTotal / travelers)
  };
}
