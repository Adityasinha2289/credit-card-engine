import React from 'react';
import type { MarketplaceOffer } from '../types';
import { ArrowRight, ExternalLink, Percent, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface OfferCardProps {
  offer: MarketplaceOffer;
  isFeatured?: boolean;
}

export function OfferCard({ offer, isFeatured = false }: OfferCardProps) {
  const getIcon = () => {
    switch (offer.discountType) {
      case 'percentage': return <Percent className="w-3.5 h-3.5 text-[#237E45]" />;
      case 'points_multiplier': return <Sparkles className="w-3.5 h-3.5 text-[#237E45]" />;
      default: return <Tag className="w-3.5 h-3.5 text-[#237E45]" />;
    }
  };

  const formattedDiscount = offer.discountType === 'percentage' 
    ? `${offer.discountValue}% Off` 
    : offer.discountType === 'flat' 
      ? `₹${offer.discountValue} Off`
      : offer.discountType === 'points_multiplier'
        ? `${offer.discountValue}x Points` : '';

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group flex flex-col h-full bg-gradient-to-br from-[#0a1510] to-[#050806] border border-white/[0.04] rounded-[28px] overflow-hidden hover:border-[#237E45]/40 hover:shadow-[0_8px_32px_rgba(35,126,69,0.12)] transition-all duration-300 cursor-pointer relative ${isFeatured ? 'md:flex-row' : ''}`}
      onClick={() => {
        if (offer.affiliateUrl) {
          window.open(offer.affiliateUrl, '_blank');
        }
      }}
    >
      {/* Subtle Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-[#237E45] opacity-0 group-hover:opacity-10 blur-[100px] transition-opacity duration-500 pointer-events-none" />

      {/* For featured cards, we can add a visual asset area. Since we only have logos, we create an abstract patterned area */}
      {isFeatured && (
        <div className="hidden md:flex w-2/5 bg-[#07120d] relative overflow-hidden items-center justify-center border-r border-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent opacity-50" />
          <div className="relative z-10 w-24 h-24 rounded-full bg-white flex items-center justify-center p-2 shadow-2xl">
             {offer.partnerLogo ? (
                <img src={offer.partnerLogo} alt={offer.partnerName} className="w-full h-full object-contain rounded-full" />
              ) : (
                <span className="text-[#050806] font-display font-bold text-4xl">{offer.partnerName.charAt(0)}</span>
              )}
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
             <CheckCircle2 className="w-3.5 h-3.5 text-[#237E45]" />
             <span className="text-[10px] text-white/80 font-semibold tracking-wider uppercase">Verified Partner</span>
          </div>
        </div>
      )}

      <div className={`flex flex-col flex-1 p-6 lg:p-8 ${isFeatured ? 'w-3/5' : 'w-full'}`}>
        {/* Brand Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {!isFeatured && (
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 border-2 border-white/[0.05] shadow-lg shrink-0">
                {offer.partnerLogo ? (
                  <img src={offer.partnerLogo} alt={offer.partnerName} className="w-full h-full object-contain rounded-full" />
                ) : (
                  <span className="text-[#050806] font-display font-bold text-xl">{offer.partnerName.charAt(0)}</span>
                )}
              </div>
            )}
            
            <div className="flex flex-col">
              <h4 className="text-base font-semibold text-white tracking-wide">{offer.partnerName}</h4>
              
              {offer.isDiscovery ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">
                  Brand Partner
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#237E45] uppercase tracking-wider mt-1 bg-[#237E45]/10 px-2 py-0.5 rounded-md w-fit border border-[#237E45]/20">
                  {getIcon()} <span>{formattedDiscount}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:bg-[#237E45]/20 group-hover:border-[#237E45]/40 transition-colors">
            <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-[#237E45] transition-colors" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <h5 className={`font-medium text-white mb-2 leading-tight ${isFeatured ? 'text-2xl lg:text-3xl line-clamp-2' : 'text-lg line-clamp-1'}`}>
            {offer.title || offer.partnerName}
          </h5>
          <p className={`text-white/50 leading-relaxed font-light ${isFeatured ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'}`}>
            {offer.description}
          </p>
        </div>

        {/* Footer Area with Networks & CTA */}
        <div className="mt-8 pt-5 border-t border-white/[0.04] flex items-center justify-between">
          {!offer.isDiscovery ? (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                {offer.minimumSpend ? `Min. ₹${offer.minimumSpend}` : 'No Min Spend'}
              </span>
              <div className="flex -space-x-1.5 mt-1">
                {offer.eligibleNetworks?.slice(0, 3).map((n, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-[#E5E7EB] border-2 border-[#050806] flex items-center justify-center text-[8px] font-bold text-black z-10 shadow-sm relative" style={{ zIndex: 10 - i }}>
                    {n.charAt(0)}
                  </div>
                ))}
                {(offer.eligibleNetworks?.length || 0) > 3 && (
                  <div className="w-6 h-6 rounded-full bg-[#1F2937] border-2 border-[#050806] flex items-center justify-center text-[9px] font-bold text-white z-0 shadow-sm">
                    +{(offer.eligibleNetworks?.length || 0) - 3}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
               <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Available</span>
               <span className="text-xs font-medium text-white/70 mt-1">Verified on RenoCred</span>
            </div>
          )}

          {/* Bold CTA */}
          <div className="flex items-center gap-2 text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
            {offer.isDiscovery ? 'Explore Brand' : 'Explore Offer'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#237E45]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
