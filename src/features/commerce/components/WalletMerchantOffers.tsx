import React, { useEffect, useState } from 'react';
import { CommerceRepository } from '../repositories';
import type { CommerceOffer } from '../types';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { Loader2, Tag, Percent, Sparkles, ExternalLink, Wallet, ShoppingBag } from 'lucide-react';

import { OfferEligibilityEngine } from '../services/OfferEligibilityEngine';

export function WalletMerchantOffers() {
  const userCards = useDashboardStore(s => s.userCards);
  const [offers, setOffers] = useState<CommerceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadOffers() {
      try {
        setLoading(true);
        const data = await CommerceRepository.getEligibleOffers();
        if (mounted) setOffers(data);
      } catch (err: any) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadOffers();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#2A9D5C] gap-4 bg-white border border-gray-200 rounded-[24px]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium text-gray-900">Discovering your card offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-red-500 gap-4 bg-white border border-red-100 rounded-[24px]">
        <p className="text-sm font-medium text-gray-900">Unable to load merchant offers.</p>
        <p className="text-xs text-gray-600">Please try again later.</p>
      </div>
    );
  }

  if (userCards.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-[24px] p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
          <Wallet size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Your wallet is empty</h3>
        <p className="text-sm text-gray-600 mt-2">Add a payment method to unlock merchant offers.</p>
      </div>
    );
  }

  // Grouping logic
  const forYouOffers: CommerceOffer[] = [];
  const genericOffers: CommerceOffer[] = [];

  const context = {
    userId: useDashboardStore.getState().profile?.id || 'unknown',
    walletCardIds: userCards.map(c => c.id)
  };

  offers.forEach(offer => {
    const result = OfferEligibilityEngine.evaluate(offer, context);
    if (result.isEligible) {
      if (result.applicableWalletCardIds.includes('all_cards')) {
        genericOffers.push(offer);
      } else {
        forYouOffers.push(offer);
      }
    }
  });

  if (offers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-[24px] p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
          <ShoppingBag size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No offers available right now</h3>
        <p className="text-sm text-gray-600 mt-2">Check back later for new merchant rewards on your cards.</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'percentage_discount': return <Percent className="w-3.5 h-3.5" />;
      case 'points': return <Sparkles className="w-3.5 h-3.5" />;
      default: return <Tag className="w-3.5 h-3.5" />;
    }
  };

  const renderOffer = (offer: CommerceOffer) => {
    const formattedDiscount = offer.offerType === 'percentage_discount'
      ? `${offer.value}% Off`
      : offer.offerType === 'flat_discount'
        ? `₹${offer.value} Off`
        : offer.offerType === 'points'
          ? `${offer.value}x Points` : `${offer.value} Reward`;

    return (
      <div key={offer.id} className="group flex flex-col justify-between p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#2A9D5C]/40 hover:shadow-sm transition-all cursor-pointer min-w-[280px] w-full snap-start relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A9D5C]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{offer.source}</h4>
              <h5 className="text-sm font-semibold text-gray-900">{offer.title}</h5>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#2A9D5C]/10 transition-colors shrink-0">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#2A9D5C]" />
            </div>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">{offer.description}</p>
        </div>
        
        <div className="flex flex-col gap-2 relative z-10">
          {offer.minSpend && offer.minSpend > 0 && (
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Min Spend: ₹{offer.minSpend}</span>
          )}
          <div className="flex items-center justify-between mt-1 pt-4 border-t border-gray-100">
             <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A9D5C] uppercase tracking-wider bg-[#2A9D5C]/10 px-2.5 py-1 rounded-md">
                {getIcon(offer.offerType)} <span>{formattedDiscount}</span>
             </div>
             {offer.validUntil && (
               <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Valid {new Date(offer.validUntil).toLocaleDateString()}</span>
             )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full relative z-10">
      {forYouOffers.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#2A9D5C] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2A9D5C]" />
            FOR YOU
          </h3>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 hide-scrollbar snap-x snap-mandatory">
            {forYouOffers.map(renderOffer)}
          </div>
        </div>
      )}

      {genericOffers.length > 0 && (
        <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
          <h3 className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-gray-600 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            MORE OFFERS
          </h3>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 hide-scrollbar snap-x snap-mandatory">
            {genericOffers.map(renderOffer)}
          </div>
        </div>
      )}
    </div>
  );
}
