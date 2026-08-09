import { PaymentMethod } from '../types';

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-hdfc-diners',
    type: 'credit_card',
    name: 'Diners Club Black',
    provider: 'HDFC',
    metadata: { network: 'diners', rewardType: 'points' },
  },
  {
    id: 'pm-sbi-cashback',
    type: 'credit_card',
    name: 'Cashback Card',
    provider: 'SBI',
    metadata: { network: 'visa', rewardType: 'cashback' },
  },
  {
    id: 'pm-axis-ace',
    type: 'credit_card',
    name: 'Ace',
    provider: 'Axis',
    metadata: { network: 'visa', rewardType: 'cashback' },
  },
  {
    id: 'pm-icici-upi',
    type: 'upi',
    name: 'UPI',
    provider: 'ICICI',
    metadata: {},
  },
  {
    id: 'pm-paytm-wallet',
    type: 'wallet',
    name: 'Wallet',
    provider: 'Paytm',
    metadata: {},
  },
];
