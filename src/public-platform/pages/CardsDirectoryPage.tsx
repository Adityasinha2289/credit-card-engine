import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getAllPublicCards } from '../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { CreditCard as PhysicalCard } from '../../features/cards/components/CreditCard';
import { Shield, Sparkles, Filter, ChevronRight, Search, CreditCard as CreditCardIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['all', 'travel', 'shopping', 'dining', 'fuel', 'utilities'];

export function CardsDirectoryPage() {
  const allCards = getAllPublicCards();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';
  
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES.includes(initialCategory) ? initialCategory : 'all'
  );
  
  // Update if URL changes externally
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    }
  }, [location.search]);

  const [selectedIssuer, setSelectedIssuer] = useState<string>('all');
  const issuers = Array.from(new Set(allCards.map((c) => c.issuer)));

  const filteredCards = allCards.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.categories.includes(selectedCategory);
    const matchesIssuer = selectedIssuer === 'all' || c.issuer === selectedIssuer;
    return matchesCategory && matchesIssuer;
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Credit Cards Directory', item: '/cards' },
  ]);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full relative min-h-[100dvh] bg-editorial-light-cream text-editorial-deep-forest selection:bg-[#008933]/20 font-sans">
      <SEO
        title="Indian Credit Cards Directory (2026) | Compare 130+ Cards | RenoCred"
        description="Explore verified Indian credit cards from HDFC, SBI, Axis, and ICICI Bank. Compare reward rates, lounge access, annual fees, and forex markups."
        canonicalUrl="https://renocred.com/cards"
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      {/* Hero Header */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-28 sm:pt-32 pb-12 lg:pb-16 text-center sm:text-left flex flex-col items-center sm:items-start">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest border border-editorial-soft-sage/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-white/50 mb-6"
        >
          THE RENO CRED CARD DIRECTORY
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-editorial-deep-forest mb-6 leading-[1.05]"
        >
          Indian Credit Cards<br className="hidden sm:block" /> Directory.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-editorial-muted-sage max-w-2xl font-light leading-relaxed"
        >
          Compare reward structures, lounge privileges, milestone bonuses, annual fees and more.
        </motion.p>
      </section>

      {/* Filters & Grid */}
      <main className="relative w-full max-w-7xl mx-auto px-6 pb-24 flex flex-col md:flex-row gap-8 lg:gap-12 xl:gap-16 items-start">
        
        {/* Mobile Filters (Dropdowns) */}
        <div className="w-full flex flex-col gap-4 md:hidden">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest flex items-center gap-2">
              <span className="w-3 h-[1px] bg-editorial-muted-sage/30"></span>
              Filter by Bank
            </label>
            <div className="relative">
              <select
                value={selectedIssuer}
                onChange={(e) => setSelectedIssuer(e.target.value)}
                className="w-full appearance-none bg-white border border-editorial-soft-sage/30 text-editorial-deep-forest font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#008933]/20"
              >
                <option value="all">All Banks</option>
                {issuers.sort().map(iss => <option key={iss} value={iss}>{iss}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-editorial-muted-sage">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest flex items-center gap-2">
              <span className="w-3 h-[1px] bg-editorial-muted-sage/30"></span>
              Category
            </label>
            <div className="flex overflow-x-auto pb-2 -mx-6 px-6 gap-2 no-scrollbar scroll-smooth">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all whitespace-nowrap shrink-0 border ${
                    selectedCategory === cat
                      ? 'bg-editorial-forest text-editorial-light-cream border-editorial-forest shadow-sm'
                      : 'bg-white text-editorial-deep-forest border-editorial-soft-sage/30 hover:bg-editorial-soft-sage/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Left Sidebar: Banks */}
        <aside className="hidden md:block w-48 lg:w-56 shrink-0">
          <div className="sticky top-28 flex flex-col gap-6">
            <h3 className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[1px] bg-editorial-muted-sage/30"></span>
              BANKS
            </h3>
            
            <div className="flex flex-col gap-1 max-h-[calc(100dvh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
              <button
                onClick={() => setSelectedIssuer('all')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                  selectedIssuer === 'all'
                    ? 'bg-editorial-forest text-editorial-light-cream font-medium shadow-sm'
                    : 'text-editorial-muted-sage hover:bg-editorial-soft-sage/10 hover:text-editorial-deep-forest font-light'
                }`}
              >
                All Banks
              </button>
              
              <div className="w-full h-px bg-editorial-soft-sage/20 my-2" />
              
              {issuers.sort().map((iss) => (
                <button
                  key={iss}
                  onClick={() => setSelectedIssuer(iss)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                    selectedIssuer === iss
                      ? 'bg-editorial-forest text-editorial-light-cream font-medium shadow-sm'
                      : 'text-editorial-muted-sage hover:bg-editorial-soft-sage/10 hover:text-editorial-deep-forest font-light'
                  }`}
                >
                  {iss}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content: Categories & Grid */}
        <div className="flex-1 min-w-0">
          
          {/* Desktop Category Filters */}
          <div className="hidden md:flex flex-wrap items-center gap-2 pb-8 mb-8 border-b border-editorial-soft-sage/20">
            <span className="text-[10px] font-bold text-editorial-muted-sage uppercase tracking-widest mr-4">
              Categories
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all border ${
                  selectedCategory === cat
                    ? 'bg-editorial-forest text-editorial-light-cream border-editorial-forest shadow-sm'
                    : 'bg-transparent text-editorial-deep-forest border-editorial-soft-sage/30 hover:bg-white hover:shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredCards.length === 0 && (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-white border border-editorial-soft-sage/20 rounded-3xl">
              <Search className="w-8 h-8 text-editorial-muted-sage mb-4" />
              <h3 className="text-xl font-serif text-editorial-deep-forest font-medium mb-2">No matches found</h3>
              <p className="text-editorial-muted-sage font-light max-w-sm">Try adjusting your filters or selecting a different bank to explore more cards.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setSelectedIssuer('all'); }}
                className="mt-6 px-6 py-2 bg-editorial-forest text-white rounded-full text-sm font-medium hover:bg-editorial-deep-forest transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Card Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${selectedCategory}-${selectedIssuer}`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8"
            >
              {filteredCards.map((card) => {
                // Generate a deterministic fake PAN based on the card ID string length & characters
                const fakeLast4 = ((card.id.length * 13) % 9000 + 1000).toString();
                
                return (
                  <motion.div variants={itemVariants} key={card.id}>
                    <Link
                      to={`/cards/${card.slug}`}
                      className="group relative rounded-3xl bg-white border border-editorial-soft-sage/30 hover:border-editorial-soft-sage/50 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col overflow-hidden h-full"
                    >
                      {/* Physical Card Showcase Area */}
                      <div className="p-8 pb-6 flex items-center justify-center relative bg-editorial-soft-sage/5">
                        
                        {/* Subtle interactive glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-editorial-soft-sage/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        {/* The actual card */}
                        <motion.div 
                          className="relative z-10 w-[240px] origin-center transition-all duration-500"
                          whileHover={{ scale: 1.02, y: -4 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <PhysicalCard 
                            card={{
                              id: card.id,
                              pan: `•••• •••• •••• ${fakeLast4}`,
                              cardholderName: 'RENOCRED MEMBER',
                              expiry: '12/28',
                              network: card.network.toLowerCase() as any,
                              bank: card.issuer,
                              status: 'active',
                              availableCredit: 0,
                              creditLimit: 0,
                              label: card.cardName,
                            }}
                            variant="compact"
                          />
                        </motion.div>
                        
                        {/* Contextual Badge (Top Right) */}
                        {card.categories[0] && (
                          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-editorial-soft-sage/30 px-2 py-1 rounded-md text-[9px] uppercase tracking-wider font-bold text-editorial-deep-forest shadow-sm z-20">
                            {card.categories[0]}
                          </div>
                        )}
                        
                        {/* Bank Indicator (Top Left) */}
                        <div className="absolute top-4 left-4 text-[10px] uppercase tracking-wider font-bold text-editorial-muted-sage z-20">
                          {card.issuer}
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="px-6 pb-6 pt-4 flex-1 flex flex-col bg-white">
                        <div className="mb-6">
                          <h2 className="text-xl font-serif font-medium text-editorial-deep-forest group-hover:text-[#008933] transition-colors line-clamp-1 mb-1.5">
                            {card.cardName}
                          </h2>
                          <p className="text-sm text-editorial-muted-sage line-clamp-2 leading-relaxed font-light">
                            {card.topBenefit}
                          </p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-editorial-soft-sage/20 flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-editorial-muted-sage font-bold uppercase tracking-widest">Annual Fee</span>
                            <span className="text-sm font-medium text-editorial-deep-forest">{card.formattedAnnualFee}</span>
                          </div>
                          
                          <div className="w-px h-8 bg-editorial-soft-sage/30" />
                          
                          <div className="flex flex-col gap-1 items-end">
                            <span className="text-[9px] text-editorial-muted-sage font-bold uppercase tracking-widest">Rewards</span>
                            <span className="text-sm font-medium text-editorial-deep-forest capitalize">{card.rewardType}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Adding custom scrollbar style to support the sidebar list */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(174, 195, 176, 0.3);
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
