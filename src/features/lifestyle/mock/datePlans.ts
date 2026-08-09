import type { MockDateItinerary } from '../types';

export const MOCK_DATE_ITINERARY: MockDateItinerary = {
  id: 'date-1',
  title: 'Romantic Evening in Noida',
  location: 'Noida',
  budget: 5000,
  vibe: 'Romantic',
  venues: [
    {
      id: 'ven-1',
      time: '7:00 PM',
      name: 'Dinner',
      partnerName: 'Olive Bar & Kitchen',
      type: 'dinner',
      originalCost: 3500,
      recommendation: {
        bestCard: { bankName: 'HDFC', cardName: 'Diners Club' },
        merchantOffer: { id: 'o-1', source: 'merchant', description: 'Swiggy Dineout', value: 500 },
        totalSavings: 500,
        effectiveCost: 3000,
        reason: 'HDFC Diners offers max dining benefits.',
      }
    },
    {
      id: 'ven-2',
      time: '9:30 PM',
      name: 'Live Jazz',
      partnerName: 'The Piano Man',
      type: 'activity',
      originalCost: 1000,
      recommendation: {
        bestCard: { bankName: 'ICICI', cardName: 'Amazon Pay' },
        cardReward: { id: 'o-2', source: 'card', description: '2% Reward', value: 20 },
        totalSavings: 20,
        effectiveCost: 980,
        reason: 'Best flat rate card for entertainment.',
      }
    },
    {
      id: 'ven-3',
      time: '11:30 PM',
      name: 'Ride Home',
      partnerName: 'Uber Premier',
      type: 'transport',
      originalCost: 300,
      recommendation: {
        bestCard: { bankName: 'Axis', cardName: 'Ace' },
        cardReward: { id: 'o-3', source: 'card', description: '4% Uber Cashback', value: 12 },
        totalSavings: 12,
        effectiveCost: 288,
        reason: 'Axis Ace gives direct cashback on Uber rides.',
      }
    }
  ]
};
