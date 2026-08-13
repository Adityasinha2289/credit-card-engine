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
import { clsx } from 'clsx';

export default function SubcategoryPage() {
  const { categorySlug, subcategorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/app') ? '/app/marketplace' : '/marketplace';
  
  const category = MARKETPLACE_CATEGORIES.find(c => c.slug === categorySlug);
  const subcategory = category?.subcategories.find(s => s.slug === subcategorySlug);
  
  const [activeMinor, setActiveMinor] = useState<string>('all');
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category && subcategory) {
      setLoading(true);
      const minorQuery = activeMinor === 'all' ? undefined : activeMinor;
      MarketplaceService.getOffersByCategory(category.slug, subcategory.slug, minorQuery).then((data) => {
        setOffers(data);
        setLoading(false);
      });
    }
  }, [category, subcategory, activeMinor]);

  if (!category || !subcategory) {
    return <div className="p-8 text-white">Subcategory not found</div>;
  }

  return (
    <PageContainer hideHeader className="gap-8 relative text-[#F2F4F2] max-w-[1400px] mx-auto">
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#050806]" />
      
      {/* Header section matching 9.5/10 style */}
      <section className="flex flex-col gap-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-sm text-white/50 font-medium tracking-wide">
          <Link to={basePath} className="hover:text-white transition-colors">Marketplace</Link>
          <span className="opacity-30">/</span>
          <Link to={`${basePath}/${category.slug}`} className="hover:text-white transition-colors">{category.name}</Link>
          <span className="opacity-30">/</span>
          <span className="text-[#237E45]">{subcategory.name}</span>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <button 
            onClick={() => navigate(`${basePath}/${category.slug}`)} 
            className="w-12 h-12 rounded-full bg-[#07120D] border border-white/[0.04] flex items-center justify-center hover:bg-[#0c1f17] hover:border-[#237E45]/30 transition-all shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-medium text-white tracking-tight">{subcategory.name}</h1>
            <p className="text-white/50 text-base mt-2 font-light">Explore top partners in {subcategory.name.toLowerCase()}</p>
          </div>
        </div>
      </section>

      {/* Sub-Subcategory Chips */}
      {subcategory.subSubCategories && subcategory.subSubCategories.length > 0 && (
        <section className="flex flex-wrap gap-3 pb-6 border-b border-white/[0.04]">
          <button 
            onClick={() => setActiveMinor('all')}
            className={clsx(
              "px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md",
              activeMinor === 'all' 
                ? "bg-[#237E45] text-white border-transparent" 
                : "bg-[#091510] border border-white/[0.04] text-white/70 hover:text-white hover:border-[#237E45]/40"
            )}
          >
            All {subcategory.name}
          </button>
          {subcategory.subSubCategories.map(ssc => (
            <button 
              key={ssc.id} 
              onClick={() => setActiveMinor(ssc.slug)}
              className={clsx(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md",
                activeMinor === ssc.slug 
                  ? "bg-[#237E45] text-white border-transparent" 
                  : "bg-[#091510] border border-white/[0.04] text-white/70 hover:text-white hover:border-[#237E45]/40"
              )}
            >
              {ssc.name}
            </button>
          ))}
        </section>
      )}

      {/* Filters and Search */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-2">
        <div className="flex-1 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          <FilterBar filters={category.filters} onFilterChange={() => {}} />
        </div>
        <div className="relative w-full lg:w-72 flex-shrink-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input 
            type="text" 
            placeholder={`Search ${subcategory.name}...`} 
            className="w-full bg-[#07120D] border border-white/[0.06] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-[#237E45]/50 focus:bg-[#0a1811] focus:outline-none transition-all shadow-inner"
          />
        </div>
      </section>

      {/* Offers Grid */}
      <section className="pb-24 pt-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-medium flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#237E45]" />
            {activeMinor === 'all' ? 'All Partners' : subcategory.subSubCategories?.find(s => s.slug === activeMinor)?.name}
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/60 font-semibold tracking-wider uppercase">
            {offers.length} Partners
          </span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i, idx) => (
              <div key={i} className={`h-[320px] rounded-[32px] bg-white/[0.02] animate-pulse border border-white/[0.02] md:col-span-4`} />
            ))}
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {offers.map((offer, idx) => {
              // In subcategory page, we use a uniform grid to show density
              return (
                <div key={offer.id} className="md:col-span-4 lg:col-span-4">
                  <OfferCard offer={offer} isFeatured={false} />
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
            <div className="absolute inset-0 bg-gradient-to-b from-[#237E45]/5 to-transparent pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-[#0a1a13] flex items-center justify-center mb-6 border border-[#237E45]/20 shadow-[0_0_40px_rgba(35,126,69,0.1)]">
              <Search className="w-8 h-8 text-[#237E45]" />
            </div>
            <h4 className="text-2xl font-display font-medium text-white mb-3">No partners found.</h4>
            <p className="text-base text-white/50 max-w-md">We don't have any partners in this exact category right now. Check back later or explore other categories.</p>
          </motion.div>
        )}
      </section>
    </PageContainer>
  );
}
