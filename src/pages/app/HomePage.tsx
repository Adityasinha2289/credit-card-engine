import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { CommerceOptimizationService } from '../../features/commerce';
import { cn } from '../../lib/utils';
import { CreditCard as PhysicalCard } from '../../features/cards/components/CreditCard';
import type { CardData } from '../../features/cards/types/card.types';
import { 
  Search, Layers, CreditCard, Compass, Plane, Utensils, 
  ShoppingBag, CheckCircle2, ArrowRight, TrendingUp, 
  Sparkles, AlertCircle, BookOpen, Receipt, Heart, Plus
} from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { recommendCards, type UserProfile } from '../../features/finix/lib/recommendEngine';
import type { SpendCategory } from '../../features/finix/data/cardDataset';

import { useUser } from '@clerk/clerk-react';
import { useProfileQuery, useUserCardsQuery } from '../../hooks/queries';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: profileQuery } = useProfileQuery(user?.id);
  const { data: userCardsQuery } = useUserCardsQuery(user?.id);
  const profileStore = useDashboardStore((s) => s.profile);
  const userCardsStore = useDashboardStore((s) => s.userCards);

  const profile = profileQuery ?? profileStore;
  const userCards = userCardsStore;

  const [savings, setSavings] = useState<number>(0);

  useEffect(() => {
    async function fetchResults() {
      try {
        const userId = profile?.id;
        if (!userId) return;
        const data = await CommerceOptimizationService.optimizeCollection(userId);
        const total = data.reduce((sum, { result }) => sum + result.savings, 0);
        setSavings(total > 0 ? total : 12000);
      } catch (err) {
        console.error("Failed to load commerce data", err);
      }
    }
    fetchResults();
  }, [profile?.id]);

  // Greetings logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = profile?.name ? profile.name.split(' ')[0] : 'Aditya';

  // Dynamic Recommendations based on User Profile
  const recommendedCards = React.useMemo(() => {
    const userProfile: UserProfile = {
      annualIncome: profile?.salary || 1500000,
      cibilScore: profile?.creditScore || 750,
      topCategories: (profile?.spendCategories || []) as SpendCategory[],
      maxAnnualFee: 50000, // No strict limit to show the best cards
      wantsLounge: profile?.primaryGoal === 'Travel Rewards',
    };
    return recommendCards(userProfile, 3);
  }, [profile?.salary, profile?.creditScore, profile?.spendCategories, profile?.primaryGoal]);

  const mainRec = recommendedCards[0];
  const altRecs = recommendedCards.slice(1, 3);

  // Marketplace categories
  const categories = [
    { 
      id: 'travel', 
      label: 'Travel & Flights', 
      desc: 'Maximize miles, hotel stays and travel rewards.', 
      icon: Plane, 
      path: '/app/marketplace/travel',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop'
    },
    { 
      id: 'lifestyle', 
      label: 'Lifestyle', 
      desc: 'Curated offers across fashion, wellness and premium life.', 
      icon: Compass, 
      path: '/app/marketplace/lifestyle',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=600&auto=format&fit=crop'
    },
    { 
      id: 'shopping', 
      label: 'Shopping', 
      desc: 'Earn more on every purchase across top brands.', 
      icon: ShoppingBag, 
      path: '/app/marketplace/shopping',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=600&auto=format&fit=crop'
    },
    { 
      id: 'dining', 
      label: 'Dining', 
      desc: 'Get the best rewards at your favourite restaurants.', 
      icon: Utensils, 
      path: '/app/marketplace/dining',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop'
    },
    { 
      id: 'learning', 
      label: 'Learning', 
      desc: 'Pay less, learn more with exclusive offers on courses.', 
      icon: BookOpen, 
      path: '/app/marketplace/learning',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop'
    },
    { 
      id: 'debt', 
      label: 'Debt', 
      desc: 'Smart tools and offers to help you manage and repay better.', 
      icon: Receipt, 
      path: '/app/marketplace/debt',
      image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=600&auto=format&fit=crop'
    },
    { 
      id: 'investment', 
      label: 'Investment', 
      desc: 'Grow your wealth with partners and smart reward strategies.', 
      icon: TrendingUp, 
      path: '/app/marketplace/investment',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop'
    },
    { 
      id: 'hobbies', 
      label: 'Hobbies', 
      desc: 'From gadgets to gear, rewards for what you love.', 
      icon: Heart, 
      path: '/app/marketplace/hobbies',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop'
    },
  ];

  return (
    <PageContainer hideHeader className="gap-12 md:gap-16 relative selection:bg-[#2A9D5C]/30 selection:text-gray-900">
      
      {/* ── 1. GREETING ─────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-gray-900 tracking-tight leading-tight">
          {greeting}, {userName}
        </h1>
      </section>

      {/* ── 2. YOUR WALLET & 3. TODAY'S REWARDS ─────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-gray-600">Your Wallet</h2>
            <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600 font-medium">{userCards.length} Cards</span>
          </div>
          <button 
            onClick={() => navigate('/app/wallet')}
            className="text-xs font-semibold text-[#2A9D5C] uppercase tracking-widest hover:text-gray-900 transition-colors flex items-center gap-1.5"
          >
            View wallet <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Wallet Rail — PhysicalCard variant wallet */}
        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-1 -mx-6 px-6 sm:mx-0 sm:px-0">
          {userCards.length === 0 ? (
            <div 
              onClick={() => navigate('/app/wallet')}
              className="flex-none w-full max-w-[360px] aspect-[1.586] rounded-[20px] flex flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-500 cursor-pointer hover:border-[#2A9D5C]/50 hover:bg-[#2A9D5C]/5 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-600">
                <Plus size={24} />
              </div>
              <span className="text-sm font-medium text-gray-900">Add your first card here</span>
              <span className="text-xs text-gray-600 mt-1">Unlock intelligence and rewards</span>
            </div>
          ) : (
            userCards.slice(0, 3).map(card => (
              <PhysicalCard
                key={card.id}
                card={card}
                variant="wallet"
                onClick={() => navigate('/app/wallet')}
              />
            ))
          )}

          {userCards.length > 3 && (
            <div
              onClick={() => navigate('/app/wallet')}
              className="flex-none w-[248px] aspect-[1.586] rounded-[20px] flex flex-col items-center justify-center border border-dashed border-gray-300 cursor-pointer hover:border-[#2A9D5C]/40 hover:bg-[#2A9D5C]/5 transition-all group"
            >
              <span className="text-[22px] font-light text-gray-400 group-hover:text-[#2A9D5C] transition-colors mb-1">+{userCards.length - 3}</span>
              <span className="text-[9px] uppercase tracking-widest font-semibold text-gray-400 group-hover:text-[#2A9D5C]/70">More Cards</span>
            </div>
          )}
        </div>


      </section>

      {/* ── 4. FOR YOU (Editorial Recommendation Area) ───────────────────────── */}
      {userCards.length > 0 && (
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_360px] gap-12 items-start border-t border-gray-300 pt-8 md:pt-12 mt-2">
        {/* Main Recommendation (Left Column) */}
        <div className="flex flex-col gap-6">
          <p className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#2A9D5C] flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Best match for you
          </p>

          <PhysicalCard
            card={mainRec}
            variant="recommendation"
            onClick={() => navigate('/app/credit/advisor')}
          />

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl md:text-2xl font-display font-medium text-gray-900">{mainRec.name}</h3>
            <p className="text-base text-[#2A9D5C] font-medium">{mainRec.matchPercent}% Match Score</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
              {mainRec.highlights?.[0] || 'Based on your CIBIL and spending habits, this card could maximize your returns.'}
            </p>
            <button
              onClick={() => navigate('/app/credit/advisor')}
              className="text-xs font-bold text-[#2A9D5C] uppercase tracking-widest flex items-center gap-1.5 hover:text-gray-900 transition-colors pt-2"
            >
              View card <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alternatives (Right Column) — compact card visual + info */}
        <div className="flex flex-col pl-0 md:pl-8 md:border-l border-gray-300 min-w-0">
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-gray-600 mb-6">Other Options</span>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-2 -mx-6 px-6 md:mx-0 md:px-0">
            {altRecs.map((rec) => (
              <div
                key={rec.id}
                onClick={() => navigate('/app/credit/advisor')}
                className="flex flex-col gap-3 cursor-pointer group flex-none w-[280px]"
              >
                <PhysicalCard
                  card={rec}
                  variant="compact"
                  onClick={() => navigate('/app/credit/advisor')}
                />
                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#2A9D5C] transition-colors truncate">{rec.name}</h4>
                  <span className="text-sm font-semibold text-[#2A9D5C]">{rec.matchPercent}% Match</span>
                  <p className="text-xs text-gray-600 truncate">{rec.highlights?.[0] || 'Great alternative for your profile.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── 3. LIFESTYLE / DISCOVERY ────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-gray-300 pb-4">
          <h2 className="text-xl md:text-2xl font-display font-medium text-gray-900">Planning Something?</h2>
          <p className="text-sm text-gray-600">Explore opportunities selected around how you spend.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mt-2">
          {categories.slice(0, 4).map(cat => (
            <button 
              key={cat.id}
              onClick={() => navigate(cat.path)}
              className="group relative flex flex-col justify-end text-left h-[180px] sm:h-[340px] rounded-[16px] sm:rounded-[24px] overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl"
            >
              {/* Background Image Container (Full coverage) */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />
              </div>

              {/* Gradient Overlay (Starts from bottom to protect text) */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              
              {/* Top: Icon Container */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-6 z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200/50 shadow-sm flex items-center justify-center bg-white/90 backdrop-blur-md transition-colors duration-300 group-hover:border-[#2A9D5C]/40 group-hover:bg-green-50">
                  <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2A9D5C]" strokeWidth={2} />
                </div>
              </div>

              {/* Bottom: Typography & CTA */}
              <div className="relative z-10 p-3 sm:p-6 w-full mt-auto">
                <h3 className="text-[15px] sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-2">{cat.label}</h3>
                <p className="text-[11px] sm:text-sm text-gray-700 leading-snug line-clamp-2 sm:mb-4">
                  {cat.desc}
                </p>
                <div className="hidden sm:flex items-center gap-1.5 text-[14px] font-semibold text-[#2A9D5C] group-hover:text-[#1A5C32] transition-colors duration-300">
                  Explore {cat.label.split(' ')[0].toLowerCase()} <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center mt-2">
          <button 
            onClick={() => navigate('/app/marketplace')}
            className="px-6 py-3 rounded-full bg-gray-100 border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-200 hover:text-gray-900 transition-all flex items-center gap-2 group"
          >
            View more options <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── 6. CREDIT INTELLIGENCE ─────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-5 mt-8">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#2A9D5C]/70 mb-1">Your Credit Intelligence</h2>
          <h3 className="text-[26px] font-medium text-gray-900">Smarter insights. Maximum rewards.</h3>
          <p className="text-[14px] text-gray-600 mt-1">AI-powered intelligence to help you choose, compare and use your cards the right way.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          {/* Card 1: Find my best card */}
          <button 
            onClick={() => navigate('/app/credit/recommend')}
            className="group relative flex flex-row md:flex-col items-center md:items-start text-left p-4 md:p-6 h-auto md:h-[220px] rounded-[16px] md:rounded-[24px] bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden gap-4 md:gap-0"
          >
            {/* Visual: Subtle radial signal */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#2A9D5C]/5 to-transparent"
            />
            
            <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-green-50 flex items-center justify-center md:mb-4">
              <Search className="w-5 h-5 text-[#2A9D5C]" strokeWidth={2} />
            </div>
            
            <div className="relative z-10 flex-1 min-w-0">
              <h4 className="text-[15px] md:text-[20px] lg:text-[22px] font-semibold text-gray-900 md:mb-2 leading-tight">Find my best card</h4>
              <p className="hidden md:block text-[14px] text-gray-500 leading-relaxed pr-4">Analyze your spending to find the card that gives you the most value.</p>
            </div>
            
            <div className="relative z-10 md:mt-auto flex items-center gap-1.5 text-[13px] text-[#2A9D5C] font-semibold transition-transform duration-300 group-hover:translate-x-1 shrink-0">
              <span className="hidden md:inline">Find your best card</span> <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 2: Compare my cards */}
          <button 
            onClick={() => navigate('/app/wallet')}
            className="group relative flex flex-row md:flex-col items-center md:items-start text-left p-4 md:p-6 h-auto md:h-[220px] rounded-[16px] md:rounded-[24px] bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden gap-4 md:gap-0"
          >
            {/* Visual: Overlapping card outlines */}
            <div className="hidden md:block absolute right-0 bottom-0 pointer-events-none w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
              <div className="absolute right-4 bottom-4 w-24 h-16 border border-[#2A9D5C]/20 rounded-xl rotate-[-10deg]" />
              <div className="absolute -right-2 -bottom-2 w-24 h-16 border border-[#2A9D5C]/30 rounded-xl rotate-[5deg] bg-white backdrop-blur-[1px]" />
            </div>

            <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-green-50 flex items-center justify-center md:mb-4">
              <Layers className="w-5 h-5 text-[#2A9D5C]" strokeWidth={2} />
            </div>
            
            <div className="relative z-10 flex-1 min-w-0">
              <h4 className="text-[15px] md:text-[20px] lg:text-[22px] font-semibold text-gray-900 md:mb-2 leading-tight">Compare my cards</h4>
              <p className="hidden md:block text-[14px] text-gray-500 leading-relaxed pr-4">Compare the cards already in your wallet and see which performs better.</p>
            </div>
            
            <div className="relative z-10 md:mt-auto flex items-center gap-1.5 text-[13px] text-[#2A9D5C] font-semibold transition-transform duration-300 group-hover:translate-x-1 shrink-0">
              <span className="hidden md:inline">Compare now</span> <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Card 3: Which card should I use? */}
          <button 
            onClick={() => navigate('/app/wallet')}
            className="group relative flex flex-row md:flex-col items-center md:items-start text-left p-4 md:p-6 h-auto md:h-[220px] rounded-[16px] md:rounded-[24px] bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden gap-4 md:gap-0"
          >
            {/* Visual: Transaction line signal path */}
            <div className="hidden md:block absolute right-4 bottom-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <svg className="w-24 h-12" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 30 Q 30 0, 60 20 T 100 10" stroke="#2A9D5C" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
                <circle cx="100" cy="10" r="3" fill="#2A9D5C" />
                <circle cx="100" cy="10" r="6" fill="#2A9D5C" fillOpacity="0.2" />
              </svg>
            </div>

            <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-green-50 flex items-center justify-center md:mb-4">
              <CreditCard className="w-5 h-5 text-[#2A9D5C]" strokeWidth={2} />
            </div>
            
            <div className="relative z-10 flex-1 min-w-0">
              <h4 className="text-[15px] md:text-[20px] lg:text-[22px] font-semibold text-gray-900 md:mb-2 leading-tight">Which card should I use?</h4>
              <p className="hidden md:block text-[14px] text-gray-500 leading-relaxed pr-4">Find the optimal card for a specific transaction.</p>
            </div>
            
            <div className="relative z-10 md:mt-auto flex items-center gap-1.5 text-[13px] text-[#2A9D5C] font-semibold transition-transform duration-300 group-hover:translate-x-1 shrink-0">
              <span className="hidden md:inline">Get recommendation</span> <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </section>

      {/* ── 7. NEXT FOR YOU ─────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-2 mt-2">
        <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-600 mb-1">Next for you</h2>
        
        <div className="flex flex-col w-full max-w-2xl bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          {[
            { id: 1, text: `Review your ${userCards.length} active cards` },
            { id: 2, text: 'Upcoming bill in 4 days' },
            { id: 3, text: `₹2,450 in rewards currently unused` },
          ].map((action, i, arr) => (
            <button 
              key={action.id}
              className={cn(
                "group flex items-center justify-between px-5 py-3.5 transition-all duration-300 hover:bg-gray-50",
                i !== arr.length - 1 ? "border-b border-gray-300" : ""
              )}
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-4 h-4 text-gray-300 group-hover:text-[#2A9D5C] transition-colors duration-300" />
                <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                  {action.text}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[#2A9D5C] transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
            </button>
          ))}
        </div>
      </section>

    </PageContainer>
  );
}
