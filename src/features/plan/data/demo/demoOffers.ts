import { PartnerOffer } from '../../types';

export const DEMO_OFFERS: PartnerOffer[] = [
  {
    id: 'offer_1',
    provider: 'Greenox (Demo)',
    merchantName: 'Demo Hotel Group',
    discountDescription: '20% OFF on Stays',
    isEligible: false,
    eligibleCards: ['HDFC Diners Club Black']
  },
  {
    id: 'offer_2',
    provider: 'Greenox (Demo)',
    merchantName: 'Demo Air',
    discountDescription: '15% OFF Flights',
    isEligible: false,
    eligibleCards: ['SBI Cashback']
  },
  {
    id: 'offer_3',
    provider: 'Greenox (Demo)',
    merchantName: 'Demo Dining',
    discountDescription: 'Flat ₹500 OFF on Dining',
    isEligible: false,
    eligibleCards: ['Amex Platinum Reserve']
  },
  {
    id: 'offer_4',
    provider: 'Greenox (Demo)',
    merchantName: 'Demo Activities',
    discountDescription: '10% Cashback on Experiences',
    isEligible: false,
    eligibleCards: ['Amazon Pay ICICI']
  }
];

export const getDemoOffers = (userCards: string[]): PartnerOffer[] => {
  return DEMO_OFFERS.map(offer => ({
    ...offer,
    isEligible: offer.eligibleCards.some(c => userCards.includes(c))
  }));
};
