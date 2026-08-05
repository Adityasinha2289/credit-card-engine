import { loadCards } from '../loaders';
import { CreditCard } from '../types';

/**
 * Strongly typed interface for card filtering options.
 */
export interface CardFilters {
  issuer?: string;
  network?: string;
  maxAnnualFee?: number;
  minAnnualFee?: number;
  category?: string;
  tier?: string;
  rewardType?: string;
}

/**
 * Filters credit cards based on multiple criteria.
 * 
 * @param {CardFilters} filters The filter conditions to apply.
 * @returns {CreditCard[]} List of credit cards satisfying all provided conditions.
 */
export function filterCards(filters: CardFilters): CreditCard[] {
  return loadCards().filter(card => {
    if (filters.issuer && card.issuer?.toLowerCase() !== filters.issuer.toLowerCase()) {
      return false;
    }
    
    if (filters.network && card.network?.toLowerCase() !== filters.network.toLowerCase()) {
      return false;
    }
    
    if (filters.maxAnnualFee !== undefined) {
      if (card.annual_fee === null || card.annual_fee === undefined || card.annual_fee > filters.maxAnnualFee) {
        return false;
      }
    }
    
    if (filters.minAnnualFee !== undefined) {
      if (card.annual_fee === null || card.annual_fee === undefined || card.annual_fee < filters.minAnnualFee) {
        return false;
      }
    }
    
    if (filters.category) {
      const hasCat = card.card_categories?.some(cat => cat.toLowerCase() === filters.category!.toLowerCase());
      if (!hasCat) return false;
    }
    
    if (filters.tier && card.card_tier?.toLowerCase() !== filters.tier.toLowerCase()) {
      return false;
    }
    
    if (filters.rewardType) {
      const hasReward = card.rewards?.some(r => r.point_type.toLowerCase() === filters.rewardType!.toLowerCase());
      if (!hasReward) return false;
    }
    
    return true;
  });
}
