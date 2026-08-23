import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getAllPublicCards } from '../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../lib/schemaBuilders';
import { CreditCard as PhysicalCard } from '../../features/cards/components/CreditCard';
import { Shield, Sparkles, Filter, ChevronRight, CreditCard as CreditCardIcon } from 'lucide-react';

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

  return (
    <div className="w-full relative min-h-[100dvh] bg-white text-gray-900 selection:bg-emerald-500/30">
      <SEO
        title="Indian Credit Cards Directory (2026) | Compare 130+ Cards | RenoCred"
        description="Explore verified Indian credit cards from HDFC, SBI, Axis, and ICICI Bank. Compare reward rates, lounge access, annual fees, and forex markups."
        canonicalUrl="https://renocred.com/cards"
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      {/* Hero Header */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium text-gray-900 tracking-tight mb-6">
          Indian Credit Cards <span className="text-gray-500">Directory</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
          Compare reward structures, lounge privileges, milestone bonuses, and annual fees across India's top credit cards.
        </p>
      </section>

      {/* Filters & Grid */}
      <main className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Left Sidebar: Banks */}
        <aside className="w-full md:w-56 lg:w-64 shrink-0">
          <div className="md:sticky md:top-32">
            <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-6 px-4">Filter by Bank</h3>
            <div className="space-y-1 max-h-[calc(100dvh-12rem)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              <button
                onClick={() => setSelectedIssuer('all')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedIssuer === 'all'
                    ? 'bg-gray-100 text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                All Banks
              </button>
              {issuers.sort().map((iss) => (
                <button
                  key={iss}
                  onClick={() => setSelectedIssuer(iss)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedIssuer === iss
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-gray-200 mb-8">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mr-4 hidden sm:block">
              Category
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredCards.map((card) => {
              // Generate a deterministic fake PAN based on the card ID string length & characters
              const fakeLast4 = ((card.id.length * 13) % 9000 + 1000).toString();
              
              return (
                <Link
                  key={card.id}
                  to={`/cards/${card.slug}`}
                  className="group relative rounded-3xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* 2D Card Graphic Container - Clean canvas */}
                  <div className="p-8 pb-6 flex items-center justify-center relative">
                    {/* Subtle hover glow behind card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gray-100 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="scale-95 group-hover:scale-100 group-hover:-translate-y-1 transition-transform duration-500 ease-out origin-center relative z-10">
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
                    </div>
                  </div>

                  {/* Details Section - Minimalist & Typography focused */}
                  <div className="px-8 pb-8 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h2 className="text-[1.1rem] font-medium text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1">
                        {card.cardName}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {card.topBenefit}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Annual Fee</span>
                        <span className="text-sm font-medium text-gray-900">{card.formattedAnnualFee}</span>
                      </div>
                      
                      <div className="w-px h-8 bg-gray-200" />
                      
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Rewards</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{card.rewardType}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
