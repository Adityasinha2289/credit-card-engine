import { Budget, Subscription, SavingsGoal } from '../../types';

export const DEMO_BUDGETS: Budget[] = [
  { id: 'b_food', category: 'Food & Dining', limitAmount: 8000, spentAmount: 6400 },
  { id: 'b_shopping', category: 'Shopping', limitAmount: 7000, spentAmount: 5900 },
  { id: 'b_transport', category: 'Transport', limitAmount: 4000, spentAmount: 3200 },
  { id: 'b_entertainment', category: 'Entertainment', limitAmount: 3000, spentAmount: 2100 },
  { id: 'b_subs', category: 'Subscriptions', limitAmount: 2000, spentAmount: 1500 },
  { id: 'b_edu', category: 'Education', limitAmount: 3000, spentAmount: 2500 }
];

export const DEMO_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub_netflix', merchant: 'Netflix', amount: 649, frequency: 'MONTHLY', nextExpectedDate: '2026-10-02T00:00:00Z', category: 'Subscriptions', paymentInstrumentId: 'pi_credit_hdfc_dcb', status: 'ACTIVE', source: 'DEMO' },
  { id: 'sub_spotify', merchant: 'Spotify', amount: 119, frequency: 'MONTHLY', nextExpectedDate: '2026-09-28T00:00:00Z', category: 'Subscriptions', paymentInstrumentId: 'pi_upi_primary', status: 'ACTIVE', source: 'DEMO' },
  { id: 'sub_gym', merchant: 'Cult.fit', amount: 1200, frequency: 'MONTHLY', nextExpectedDate: '2026-10-05T00:00:00Z', category: 'Education', paymentInstrumentId: 'pi_credit_amazon', status: 'ACTIVE', source: 'DEMO' },
  { id: 'sub_prime', merchant: 'Amazon Prime', amount: 1499, frequency: 'ANNUALLY', nextExpectedDate: '2026-12-15T00:00:00Z', category: 'Subscriptions', paymentInstrumentId: 'pi_credit_amazon', status: 'ACTIVE', source: 'DEMO' },
  { id: 'sub_internet', merchant: 'Airtel Broadband', amount: 1178, frequency: 'MONTHLY', nextExpectedDate: '2026-10-10T00:00:00Z', category: 'Bills & Utilities', paymentInstrumentId: 'pi_credit_sbi_cb', status: 'ACTIVE', source: 'DEMO' }
];

export const DEMO_GOALS: SavingsGoal[] = [
  { id: 'g_laptop', goal: 'New Laptop', targetAmount: 85000, currentAmount: 42000, deadline: '2027-02-01T00:00:00Z', monthlyContribution: 8000 },
  { id: 'g_goa', goal: 'Goa Trip', targetAmount: 25000, currentAmount: 15000, deadline: '2026-12-25T00:00:00Z', monthlyContribution: 5000 },
  { id: 'g_emergency', goal: 'Emergency Fund', targetAmount: 150000, currentAmount: 110000, deadline: '2027-12-31T00:00:00Z', monthlyContribution: 10000 },
  { id: 'g_fest', goal: 'Festival Shopping', targetAmount: 20000, currentAmount: 18000, deadline: '2026-10-15T00:00:00Z', monthlyContribution: 2000 },
  { id: 'g_cert', goal: 'AWS Certification', targetAmount: 15000, currentAmount: 5000, deadline: '2026-11-30T00:00:00Z', monthlyContribution: 5000 }
];
