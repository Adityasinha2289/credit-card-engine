import { supabase } from '../../../lib/supabase';
import type { MarketplaceOffer } from '../types';
import { TRAVEL_PARTNERS } from '../data/travelPartners';
import { LIFESTYLE_PARTNERS } from '../data/lifestylePartners';
import { SHOPPING_PARTNERS } from '../data/shoppingPartners';
import { DINING_PARTNERS } from '../data/diningPartners';

export class MarketplaceService {
  static async getOffersByCategory(
    categorySlug: string, 
    subcategorySlug?: string, 
    minorCategorySlug?: string
  ): Promise<MarketplaceOffer[]> {
    try {
      const results: MarketplaceOffer[] = [];
      const seenPartners = new Set<string>();

      // 1. Fetch from the new many-to-many taxonomy mapping table
      let query = supabase
        .from('marketplace_partner_mappings')
        .select(`
          partner_id,
          category_slug,
          subcategory_slug,
          minor_category_slug,
          partners!inner (
            id,
            name,
            logo_url,
            description,
            status
          )
        `)
        .eq('category_slug', categorySlug)
        .eq('partners.status', 'active');

      if (subcategorySlug) {
        query = query.eq('subcategory_slug', subcategorySlug);
      }
      if (minorCategorySlug) {
        query = query.eq('minor_category_slug', minorCategorySlug);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        data.forEach((row: any) => {
          const partner = row.partners;
          if (!seenPartners.has(partner.id)) {
            seenPartners.add(partner.id);
            results.push({
              id: partner.id,
              partnerName: partner.name,
              partnerLogo: partner.logo_url,
              description: partner.description,
              categorySlug: row.category_slug,
              subcategorySlug: row.subcategory_slug,
              isDiscovery: true,
              affiliateUrl: '' // In real app, we'd fetch actual offers. For now, brand discovery.
            });
          }
        });
      }

      // 2. Legacy / Mock Support (for categories not yet migrated to mapping table or if migration not run)
      if (results.length === 0) {
        // Mock data mapping
        const MOCK_PARTNERS: Record<string, MarketplaceOffer[]> = {
          'travel': TRAVEL_PARTNERS,
          'lifestyle': LIFESTYLE_PARTNERS,
          'shopping': SHOPPING_PARTNERS,
          'dining': DINING_PARTNERS
        };

        if (MOCK_PARTNERS[categorySlug]) {
          let fallbackData = MOCK_PARTNERS[categorySlug];
          
          if (subcategorySlug) {
            fallbackData = fallbackData.filter((p: any) => p.subcategorySlug === subcategorySlug);
          }
          if (minorCategorySlug) {
            fallbackData = fallbackData.filter((p: any) => p.minorCategorySlug === minorCategorySlug);
          }

          fallbackData.forEach((mock: any) => {
            if (!seenPartners.has(mock.id)) {
              seenPartners.add(mock.id);
              results.push(mock);
            }
          });
        }

        // Dining legacy fallback removed to prevent broken empty URL links from legacy db data
      }

      return results;

    } catch (err) {
      console.error('MarketplaceService error:', err);
      return [];
    }
  }

  static async searchOffers(query: string): Promise<MarketplaceOffer[]> {
    return [];
  }
}
