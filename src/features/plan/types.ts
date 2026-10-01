export type PlanCategory = 'trip' | 'romantic_date' | 'movie' | 'weekend_escape' | 'food_day' | 'occasion';
export type PlanStatus = 'draft' | 'generating' | 'ready' | 'archived' | 'failed';

export interface PlanSession {
  id: string;
  userId: string;
  planType: PlanCategory;
  status: PlanStatus;
  currentPhase: number;
  draft: any; // Will be typed based on planType later
  selectedPlan: any | null; // The final selected variant structure
  schemaVersion: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string;
  completedAt: string | null;
}

export type TransportMode = 'FLIGHT' | 'TRAIN' | 'BUS' | 'CAB' | 'MY_OWN_VEHICLE';

export type StayPreference = 'NO_STAY' | 'HOSTEL_GUESTHOUSE' | '2_STAR' | '3_STAR' | '4_STAR' | '5_STAR';

export type BudgetPreference = 'LOW' | 'MID' | 'PREMIUM';

export interface LocationData {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface TripPlanDraft {
  origin: LocationData | null;
  destination: LocationData | null;
  departureDate: string | null; // ISO string
  returnDate: string | null; // ISO string
  tripType: 'one-way' | 'round-trip';
  travelers: number;
  transportMode: TransportMode | null;
  vehicleFuelEfficiency?: number; // km/l
  stayPreference: StayPreference | null;
  budgetPreference: BudgetPreference | null;
  activityPreferences: string[];
  foodPreference: string[];
}

export interface ProviderMetadata {
  provider: string;
  source: string;
  fetchedAt: string;
  lastUpdated?: string;
  bookingUrl?: string;
  deepLink?: string;
}

export interface TransportOption extends ProviderMetadata {
  id: string;
  service: string; // Airline, Train name, Bus operator
  flightOrTrainNumber?: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  price: number;
  currency: string;
  availabilityStatus: 'AVAILABLE' | 'WAITLIST' | 'SOLD_OUT' | 'UNKNOWN';
}

export interface StayOption extends ProviderMetadata {
  id: string;
  hotelName: string;
  stars: number;
  locationContext: string;
  roomType: string;
  nightlyPrice: number;
  totalStayPrice: number;
  taxAndFees: number;
  availability: boolean;
  rating?: number;
  rankingReason?: 'GOOD MATCH' | 'BEST VALUE' | 'UPGRADE PICK';
}

export interface ActivityOption extends ProviderMetadata {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  estimatedTransportCost: number;
  durationMinutes: number;
  openingHours?: string;
  entryCost: number;
}

export interface FoodSuggestion extends ProviderMetadata {
  id: string;
  name: string;
  cuisine: string;
  priceLevel: string;
  rating: number;
}

export interface PartnerOffer {
  id: string;
  provider: string;
  merchantName: string;
  discountDescription: string;
  isEligible: boolean;
  eligibleCards: string[];
}

export interface PaymentStrategy {
  category: string;
  recommendedCardId: string;
  potentialRewardValue: number;
}

export interface TripBudget {
  intercityTransport: number;
  accommodation: number;
  localTransport: number;
  food: number;
  activities: number;
  buffer: number;
  totalBeforeOffers: number;
  potentialOfferValue: number;
  estimatedTotal: number;
  perPerson: number;
}

export interface ItineraryEvent {
  time: string; // HH:mm
  title: string;
  description?: string;
  type: 'TRANSPORT' | 'STAY' | 'ACTIVITY' | 'FOOD' | 'TRANSFER';
  costEstimate?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  events: ItineraryEvent[];
}

export interface PlanVariant {
  id: 'VALUE' | 'BALANCED' | 'COMFORT';
  name: string;
  description: string;
  transportOption?: TransportOption;
  stayOption?: StayOption;
  budget: TripBudget;
  itinerary: ItineraryDay[];
  paymentStrategy: PaymentStrategy[];
  appliedOffers: PartnerOffer[];
}

export interface TripPlanResult {
  draft: TripPlanDraft;
  routeDistanceKm: number;
  routeDurationMinutes: number;
  transportOptions: TransportOption[];
  stayOptions: StayOption[];
  localTransfers: any[]; 
  activities: ActivityOption[];
  foodSuggestions: FoodSuggestion[];
  partnerOffers: PartnerOffer[];
  variants: PlanVariant[];
  generatedAt: string;
  providerError?: string;
}
