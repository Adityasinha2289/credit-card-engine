export interface MockOffer {
  id: string;
  source: 'merchant' | 'card';
  description: string;
  value: number; // The discount/cashback amount in INR
}

export interface MockPaymentMethod {
  cardName: string;
  bankName: string;
  network?: string;
}

export interface MockRecommendation {
  bestCard: MockPaymentMethod;
  merchantOffer?: MockOffer;
  cardReward?: MockOffer;
  totalSavings: number;
  effectiveCost: number;
  reason: string;
}

export interface MockPartner {
  id: string;
  name: string;
  category: 'fitness' | 'learning' | 'dining' | 'travel' | 'retail' | 'experience';
  imageUrl: string;
  description: string;
}

export interface MockProduct {
  id: string;
  partnerId: string;
  name: string;
  originalPrice: number;
  imageUrl: string;
  recommendation: MockRecommendation;
}

export interface MockDateVenue {
  id: string;
  time: string;
  name: string;
  partnerName: string;
  type: 'dinner' | 'activity' | 'transport';
  originalCost: number;
  recommendation: MockRecommendation;
}

export interface MockDateItinerary {
  id: string;
  title: string;
  location: string;
  budget: number;
  vibe: string;
  venues: MockDateVenue[];
}
