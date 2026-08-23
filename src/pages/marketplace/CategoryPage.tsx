import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { MARKETPLACE_CATEGORIES } from '../../features/marketplace/taxonomy/categories';
import { PageContainer } from '../../components/shared/PageContainer';
import { FilterBar } from '../../features/marketplace/components/FilterBar';
import { OfferCard } from '../../features/marketplace/components/OfferCard';
import { MarketplaceService } from '../../features/marketplace/services/marketplaceService';
import type { MarketplaceOffer } from '../../features/marketplace/types';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/app') ? '/app/marketplace' : '/marketplace';
  
  const category = MARKETPLACE_CATEGORIES.find(c => c.slug === categorySlug);
  
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      setLoading(true);
      MarketplaceService.getOffersByCategory(category.slug).then((data) => {
        setOffers(data);
        setLoading(false);
      });
    }
  }, [category]);

  if (!category) {
    return <div className="p-8 text-white">Category not found</div>;
  }

  return (
    <PageContainer hideHeader className="gap-8 relative text-[#F2F4F2] max-w-[1400px] mx-auto">
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#050806]" />
      
      {/* Category Hero */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[280px] md:h-[360px] rounded-[32px] overflow-hidden border border-white/[0.04] bg-[#07120D] flex flex-col justify-end p-8 md:p-12 shadow-2xl"
      >
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity hover:mix-blend-normal transition-all duration-[1500ms]"
            style={{ backgroundImage: `url('${category.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-[#050806]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
          <button onClick={() => navigate(basePath)} className="flex items-center gap-2 text-sm text-white/50 hover:text-white mb-2 w-fit group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
          </button>
          <h1 className="text-4xl md:text-6xl font-display font-medium text-white tracking-tight leading-tight">{category.name}</h1>
          <p className="text-lg md:text-xl text-white/70 font-light">{category.description}</p>
        </div>
      </motion.section>

      {/* Subcategory Navigation */}
      <section className="relative w-full -mt-2">
        <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x">
          {category.subcategories.map((sub, idx) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={sub.id}
            >
              <Link 
                to={`${basePath}/${category.slug}/${sub.slug}`}
                className="snap-start flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#091510] border border-white/[0.04] hover:bg-[#0c1f17] hover:border-[#2A9D5C]/40 transition-all text-sm font-medium group shadow-lg"
              >
                <span className="text-white/70 group-hover:text-white transition-colors">{sub.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Filters and Search */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-t border-white/[0.04] pt-8">
        <div className="flex-1 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          <FilterBar filters={category.filters} onFilterChange={() => {}} />
        </div>
        <div className="relative w-full lg:w-72 flex-shrink-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input 
            type="text" 
            placeholder={`Search in ${category.name}...`} 
            className="w-full bg-[#07120D] border border-white/[0.06] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-[#2A9D5C]/50 focus:bg-[#0a1811] focus:outline-none transition-all shadow-inner"
          />
        </div>
      </section>

      {/* Offers Grid */}
      <section className="pb-24">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-medium flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#2A9D5C]" />
            Curated For You
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/60 font-semibold tracking-wider uppercase">
            {offers.length} Partners
          </span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {[1, 2, 3, 4].map((i, idx) => (
              <div key={i} className={`h-[320px] rounded-[32px] bg-white/[0.02] animate-pulse border border-white/[0.02] ${idx % 3 === 0 ? 'md:col-span-8' : 'md:col-span-4'}`} />
            ))}
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {offers.map((offer, idx) => {
              // Editorial grid logic: first item spans 8 cols, next two span 4 cols, etc.
              const isFeatured = idx % 3 === 0;
              const spanClass = isFeatured ? 'md:col-span-8' : 'md:col-span-4';
              
              return (
                <div key={offer.id} className={spanClass}>
                  <OfferCard offer={offer} isFeatured={isFeatured} />
                </div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 text-center flex flex-col items-center justify-center border border-white/[0.04] rounded-[32px] bg-[#07120D] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#2A9D5C]/5 to-transparent pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-[#0a1a13] flex items-center justify-center mb-6 border border-[#2A9D5C]/20 shadow-[0_0_40px_rgba(42,157,92,0.1)]">
              <Sparkles className="w-8 h-8 text-[#2A9D5C]" />
            </div>
            <h4 className="text-2xl font-display font-medium text-white mb-3">Premium {category.name} offers are coming.</h4>
            <p className="text-base text-white/50 max-w-md">We are currently negotiating exclusive rewards with top-tier brands in this category to ensure you get the maximum value.</p>
          </motion.div>
        )}
      </section>
    </PageContainer>
  );
}
