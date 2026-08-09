import { CommerceRepository } from '../repositories';
import { PaymentMethodProvider } from './PaymentMethodProvider';
import { OptimizationEngine } from '../../optimization/engine/optimizationEngine';
import { OptimizationOrchestrator } from '../../optimization/orchestrator';
import type { CommerceEntity, CommerceOffer } from '../types';
import type { SpendingOpportunity, Offer, OptimizationResult, ItineraryOptimizationResult } from '../../optimization/types';

export class CommerceOptimizationService {
  /**
   * Adapts a CommerceOffer (DB Schema) to an Optimization Engine Offer (Math Schema).
   * It strictly preserves all eligibility rules and math structures without discarding values.
   */
  static adaptOffer(commerceOffer: CommerceOffer): Offer {
    return {
      id: commerceOffer.id,
      name: commerceOffer.title,
      description: commerceOffer.description || '',
      type: commerceOffer.offerType,
      value: commerceOffer.value,
      source: commerceOffer.source,
      eligibility: commerceOffer.eligibilityRules || {},
    };
  }

  /**
   * Single Entity Optimization
   * Fetches necessary context (offers, payment methods) and runs the Optimization Engine
   * for a specific commerce entity.
   */
  static async optimizeEntity(
    entity: CommerceEntity,
    userId: string,
    amountOverride?: number
  ): Promise<OptimizationResult> {
    const [offers, paymentMethods] = await Promise.all([
      CommerceRepository.getEligibleOffers(),
      PaymentMethodProvider.getUserPaymentMethods(userId),
    ]);

    const optimizationOffers = offers.map(this.adaptOffer);

    const opportunity: SpendingOpportunity = {
      id: entity.id,
      partnerId: entity.partnerId,
      category: entity.categoryId as any || 'other', // fallback if null
      baseAmount: amountOverride ?? entity.basePrice,
      currency: entity.currency as 'INR',
      metadata: {
        entityType: entity.entityType,
        name: entity.name,
      }
    };

    return OptimizationEngine.optimizeSpending(opportunity, paymentMethods, optimizationOffers);
  }

  /**
   * Optimize a collection of entities concurrently.
   * Useful for ShopPage and HomePage.
   */
  static async optimizeCollection(
    userId: string,
    partnerId?: string
  ): Promise<{ entity: CommerceEntity; result: OptimizationResult }[]> {
    const [entities, offers, paymentMethods] = await Promise.all([
      CommerceRepository.getCommerceEntities(partnerId),
      CommerceRepository.getEligibleOffers(),
      PaymentMethodProvider.getUserPaymentMethods(userId),
    ]);

    const optimizationOffers = offers.map(this.adaptOffer);

    return entities.map((entity) => {
      const opportunity: SpendingOpportunity = {
        id: entity.id,
        partnerId: entity.partnerId,
        category: entity.categoryId as any || 'other',
        baseAmount: entity.basePrice,
        currency: entity.currency as 'INR',
        metadata: {
          entityType: entity.entityType,
          name: entity.name,
        }
      };

      const result = OptimizationEngine.optimizeSpending(opportunity, paymentMethods, optimizationOffers);
      
      return { entity, result };
    });
  }

  /**
   * Optimize an entire itinerary.
   */
  static async optimizeItinerary(
    opportunities: SpendingOpportunity[],
    userId: string
  ): Promise<ItineraryOptimizationResult> {
    const [offers, paymentMethods] = await Promise.all([
      CommerceRepository.getEligibleOffers(),
      PaymentMethodProvider.getUserPaymentMethods(userId),
    ]);

    const optimizationOffers = offers.map(this.adaptOffer);

    return OptimizationOrchestrator.optimizeItinerary(opportunities, paymentMethods, optimizationOffers);
  }
}
