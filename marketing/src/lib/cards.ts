import cardsData from '../data/cards.json';
import banksData from '../data/banks.json';

export interface CardRewardRate {
  category: string;
  rate: number;
  cap?: number;
}

export interface CardData {
  id: string;
  slug: string;
  name: string;
  bank: string;
  network: 'Visa' | 'Mastercard' | 'Amex' | 'RuPay';
  first4Digits?: string;
  annualFee: number;
  feeWaiverSpend?: number;
  minIncome: number;
  minCibil: number;
  welcomeBonus?: string | null;
  loungeAccess?: number;
  rewards: CardRewardRate[];
  baseRewardRate: number;
  highlights: string[];
  gradientFrom: string;
  gradientTo: string;
}

export interface BankData {
  id: string;
  name: string;
  cardCount: number;
  cardIds: string[];
}

export const ALL_CARDS: CardData[] = cardsData as CardData[];
export const ALL_BANKS: BankData[] = banksData as BankData[];

export function getCardBySlug(slug: string): CardData | undefined {
  return ALL_CARDS.find((c) => c.slug === slug || c.id === slug);
}

export function getBankBySlug(slug: string): BankData | undefined {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return ALL_BANKS.find((b) => b.id.replace(/[^a-z0-9]/g, '') === normalized || b.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
}

export function getCardsByBank(bankId: string): CardData[] {
  const bank = getBankBySlug(bankId);
  if (!bank) return [];
  return ALL_CARDS.filter((c) => c.bank.toLowerCase() === bank.name.toLowerCase() || bank.cardIds.includes(c.id));
}

export function getBestCardsForCategory(category: string, limit = 10): CardData[] {
  const cat = category.toLowerCase();
  return [...ALL_CARDS]
    .sort((a, b) => {
      const rateA = a.rewards.find((r) => r.category.toLowerCase() === cat)?.rate ?? a.baseRewardRate;
      const rateB = b.rewards.find((r) => r.category.toLowerCase() === cat)?.rate ?? b.baseRewardRate;
      return rateB - rateA;
    })
    .slice(0, limit);
}

export function getTopLoungeCards(limit = 10): CardData[] {
  return [...ALL_CARDS]
    .filter((c) => (c.loungeAccess ?? 0) > 0)
    .sort((a, b) => (b.loungeAccess ?? 0) - (a.loungeAccess ?? 0))
    .slice(0, limit);
}

export function getLifetimeFreeCards(): CardData[] {
  return ALL_CARDS.filter((c) => c.annualFee === 0);
}
