/**
 * Common Indian subscriptions: default price (paise), cycle and where to cancel.
 * Prices are typical list prices for quick-add; the user can edit them.
 */
import type { BillingCycle } from '../dashboard/types/dashboard.types';

export interface SubscriptionPreset {
  key: string;
  name: string;
  /** paise */
  amount: number;
  billingCycle: BillingCycle;
  category: string;
  cancelUrl?: string;
  /** lowercase tokens that identify this service in merchant names */
  aliases: string[];
}

export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  { key: 'netflix', name: 'Netflix', amount: 64900, billingCycle: 'monthly', category: 'entertainment', cancelUrl: 'https://www.netflix.com/cancelplan', aliases: ['netflix'] },
  { key: 'prime', name: 'Amazon Prime', amount: 149900, billingCycle: 'yearly', category: 'shopping', cancelUrl: 'https://www.amazon.in/mc', aliases: ['amazon prime', 'prime video', 'primevideo', 'amzn prime'] },
  { key: 'hotstar', name: 'JioHotstar', amount: 29900, billingCycle: 'monthly', category: 'entertainment', cancelUrl: 'https://www.hotstar.com/in/my-account', aliases: ['hotstar', 'jiohotstar', 'disney'] },
  { key: 'spotify', name: 'Spotify Premium', amount: 11900, billingCycle: 'monthly', category: 'entertainment', cancelUrl: 'https://www.spotify.com/account/cancel/', aliases: ['spotify'] },
  { key: 'youtube', name: 'YouTube Premium', amount: 14900, billingCycle: 'monthly', category: 'entertainment', cancelUrl: 'https://www.youtube.com/paid_memberships', aliases: ['youtube', 'google youtube'] },
  { key: 'apple', name: 'Apple One / iCloud', amount: 7500, billingCycle: 'monthly', category: 'subscriptions', cancelUrl: 'https://support.apple.com/en-in/118428', aliases: ['apple.com/bill', 'icloud', 'apple one', 'itunes'] },
  { key: 'google_one', name: 'Google One', amount: 13000, billingCycle: 'monthly', category: 'subscriptions', cancelUrl: 'https://one.google.com/settings', aliases: ['google one', 'google storage'] },
  { key: 'swiggy_one', name: 'Swiggy One', amount: 29900, billingCycle: 'quarterly', category: 'dining', cancelUrl: undefined, aliases: ['swiggy one'] },
  { key: 'zomato_gold', name: 'Zomato Gold', amount: 3000, billingCycle: 'monthly', category: 'dining', cancelUrl: undefined, aliases: ['zomato gold'] },
  { key: 'cultfit', name: 'cult.fit', amount: 120000, billingCycle: 'monthly', category: 'health', cancelUrl: 'https://www.cult.fit/me/memberships', aliases: ['cult.fit', 'cultfit', 'curefit'] },
  { key: 'linkedin', name: 'LinkedIn Premium', amount: 150000, billingCycle: 'monthly', category: 'subscriptions', cancelUrl: 'https://www.linkedin.com/premium/manage/', aliases: ['linkedin'] },
  { key: 'chatgpt', name: 'ChatGPT Plus', amount: 199900, billingCycle: 'monthly', category: 'subscriptions', cancelUrl: 'https://chatgpt.com/#settings/Subscription', aliases: ['openai', 'chatgpt'] },
  { key: 'claude', name: 'Claude Pro', amount: 199900, billingCycle: 'monthly', category: 'subscriptions', cancelUrl: 'https://claude.ai/settings/billing', aliases: ['anthropic', 'claude.ai'] },
  { key: 'jio_fiber', name: 'JioFiber', amount: 69900, billingCycle: 'monthly', category: 'utilities', cancelUrl: undefined, aliases: ['jio fiber', 'jiofiber'] },
  { key: 'airtel_xstream', name: 'Airtel Xstream Fiber', amount: 79900, billingCycle: 'monthly', category: 'utilities', cancelUrl: undefined, aliases: ['airtel xstream', 'airtel broadband', 'airtel fiber'] },
];

/** Best-effort match of a free-text name / merchant to a known service. */
export function findPreset(name: string): SubscriptionPreset | undefined {
  const lower = ` ${name.toLowerCase()} `;
  return SUBSCRIPTION_PRESETS.find((p) => p.aliases.some((a) => lower.includes(a)));
}

export function getCancelUrl(name: string): string | undefined {
  return findPreset(name)?.cancelUrl;
}
