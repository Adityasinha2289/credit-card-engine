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

  // For You Recommendations
  const mainRecommendation = {
    name: 'SBI Cashback',
    benefit: '5% unlimited cashback',
    value: '+₹2,400',
    reason: 'Matches your heavy online shopping spend.',
  };

  const alternativeRecommendations = [
    { name: 'Amex Platinum Travel', benefit: 'Travel milestones', value: '+₹4,200' },
    { name: 'HDFC Swiggy Card', benefit: '10% on food delivery', value: '+₹1,500' }
  ];

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
    <PageContainer hideHeader className="gap-12 md:gap-16 relative selection:bg-[#237E45]/30 selection:text-white">
      
      {/* ── 1. GREETING ─────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-[#F2F4F2] tracking-tight leading-tight">
          {greeting}, {userName}
        </h1>
      </section>

      {/* ── 2. YOUR WALLET & 3. TODAY'S REWARDS ─────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#737C77]">Your Wallet</h2>
            <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-white/60 font-medium">{userCards.length} Cards</span>
          </div>
          <button 
            onClick={() => navigate('/app/wallet')}
            className="text-xs font-semibold text-[#237E45] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
          >
            View wallet <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Wallet Rail — PhysicalCard variant wallet */}
        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-1 -mx-6 px-6 sm:mx-0 sm:px-0">
          {userCards.length === 0 ? (
            <div 
              onClick={() => navigate('/app/wallet')}
              className="flex-none w-full max-w-[360px] aspect-[1.586] rounded-[20px] flex flex-col items-center justify-center border border-dashed border-white/20 bg-[#050806]/50 cursor-pointer hover:border-[#237E45]/50 hover:bg-[#237E45]/5 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3 text-white/50">
                <Plus size={24} />
              </div>
              <span className="text-sm font-medium text-white/90">Add your first card here</span>
              <span className="text-xs text-white/50 mt-1">Unlock intelligence and rewards</span>
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
              className="flex-none w-[248px] aspect-[1.586] rounded-[20px] flex flex-col items-center justify-center border border-dashed border-white/10 cursor-pointer hover:border-[#237E45]/40 hover:bg-[#237E45]/5 transition-all group"
            >
              <span className="text-[22px] font-light text-white/40 group-hover:text-[#237E45] transition-colors mb-1">+{userCards.length - 3}</span>
              <span className="text-[9px] uppercase tracking-widest font-semibold text-white/40 group-hover:text-[#237E45]/70">More Cards</span>
            </div>
          )}
        </div>

        {/* Intelligence Strip (Today's Rewards) */}
        {userCards.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#737C77]">Today:</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#237E45]" />
              <span className="text-[11px] font-medium text-[#237E45]">3 rewards available</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-white/60" />
              <span className="text-[11px] font-medium text-white/70">5 active offers</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-[#B86A19]" />
              <span className="text-[11px] font-medium text-[#B86A19]">Swiggy 50% expires today</span>
            </div>
          </div>
        )}
      </section>

      {/* ── 4. FOR YOU (Editorial Recommendation Area) ───────────────────────── */}
      {userCards.length > 0 && (
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_360px] gap-12 items-start border-t border-white/[0.04] pt-8 md:pt-12 mt-2">
        {/* Main Recommendation (Left Column) */}
        <div className="flex flex-col gap-6">
          <p className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#237E45] flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Best match for you
          </p>

          <PhysicalCard
            card={{
              id: 'rec-sbi',
              pan: '•••• •••• •••• 1234',
              cardholderName: profile?.name?.toUpperCase() || 'ADITYA SINHA',
              expiry: '12/28',
              network: 'visa',
              bank: 'SBI Card',
              status: 'active',
              availableCredit: 0,
              creditLimit: 0,
              label: 'Cashback SBI Card',
              gradientFrom: '#1E3C72',
              gradientTo: '#2A5298'
            }}
            variant="recommendation"
            onClick={() => navigate('/app/credit/advisor')}
          />

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl md:text-2xl font-display font-medium text-[#F2F4F2]">{mainRecommendation.name}</h3>
            <p className="text-base text-[#237E45] font-medium">{mainRecommendation.value} estimated value</p>
            <p className="text-sm text-[#737C77] leading-relaxed mb-4">
              Based on your CIBIL and spending habits, this card could maximize your returns.
            </p>
            <button
              onClick={() => navigate('/app/credit/advisor')}
              className="text-xs font-bold text-[#237E45] uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-colors pt-2"
            >
              View card <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alternatives (Right Column) — compact card visual + info */}
        <div className="flex flex-col pl-0 md:pl-8 md:border-l border-white/[0.04] min-w-0">
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#737C77] mb-6">Other Options</span>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-2 -mx-6 px-6 md:mx-0 md:px-0">
            <div
              onClick={() => navigate('/app/credit/advisor')}
              className="flex flex-col gap-3 cursor-pointer group flex-none w-[280px]"
            >
            <PhysicalCard
              card={{
                id: 'rec-amex',
                pan: '•••• •••••• •3456',
                cardholderName: profile?.name?.toUpperCase() || 'ADITYA SINHA',
                expiry: '09/29',
                network: 'amex',
                bank: 'American Express',
                status: 'active',
                availableCredit: 0,
                creditLimit: 0,
                label: 'Platinum Travel',
                gradientFrom: '#8E9EAB',
                gradientTo: '#EEF2F3'
              }}
              variant="compact"
              onClick={() => navigate('/app/credit/advisor')}
            />
            <div className="flex flex-col gap-1 min-w-0">
              <h4 className="text-sm font-medium text-white/90 group-hover:text-[#237E45] transition-colors truncate">{alternativeRecommendations[0].name}</h4>
              <span className="text-sm font-semibold text-[#237E45]">{alternativeRecommendations[0].value}</span>
              <p className="text-xs text-[#737C77] truncate">{alternativeRecommendations[0].benefit}</p>
            </div>
          </div>
          
          <div
            onClick={() => navigate('/app/credit/advisor')}
            className="flex flex-col gap-3 cursor-pointer group flex-none w-[280px]"
          >
            <PhysicalCard
              card={{
                id: 'rec-hdfc',
                pan: '•••• •••• •••• 9876',
                cardholderName: profile?.name?.toUpperCase() || 'ADITYA SINHA',
                expiry: '03/30',
                network: 'mastercard',
                bank: 'HDFC Bank',
                status: 'active',
                availableCredit: 0,
                creditLimit: 0,
                label: 'Swiggy HDFC Bank',
                gradientFrom: '#FC8019',
                gradientTo: '#F2F4F2'
              }}
              variant="compact"
              onClick={() => navigate('/app/credit/advisor')}
            />
            <div className="flex flex-col gap-1 min-w-0">
              <h4 className="text-sm font-medium text-white/90 group-hover:text-[#237E45] transition-colors truncate">{alternativeRecommendations[1].name}</h4>
              <span className="text-sm font-semibold text-[#237E45]">{alternativeRecommendations[1].value}</span>
              <p className="text-xs text-[#737C77] truncate">{alternativeRecommendations[1].benefit}</p>
            </div>
          </div>
          </div>
        </div>
      </section>
      )}

      {/* ── 3. LIFESTYLE / DISCOVERY ────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4">
          <h2 className="text-xl md:text-2xl font-display font-medium text-[#F2F4F2]">Planning Something?</h2>
          <p className="text-sm text-[#737C77]">Explore opportunities selected around how you spend.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mt-2">
          {categories.slice(0, 4).map(cat => (
            <button 
              key={cat.id}
              onClick={() => navigate(cat.path)}
              className="group relative flex flex-col justify-between text-left h-[220px] sm:h-[340px] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-white/[0.04] bg-[#050806] transition-transform duration-300 hover:-translate-y-[2px] shadow-lg hover:shadow-2xl hover:shadow-[#237E45]/5"
            >
              {/* Background Image Container (Upper 60%) */}
              <div className="absolute inset-x-0 top-0 h-[65%] overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />
              </div>

              {/* Gradient Overlay for seamless fade into Obsidian base */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#050806]/40 via-[#050806]/80 to-[#050806] transition-colors duration-300 group-hover:from-[#050806]/30" />
              
              {/* Top: Icon Container */}
              <div className="relative z-10 p-3 sm:p-5 lg:p-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#237E45]/20 flex items-center justify-center bg-[#071A11]/40 backdrop-blur-md transition-colors duration-300 group-hover:border-[#237E45]/40 group-hover:bg-[#0A2418]/60">
                  <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#237E45] transition-colors duration-300 group-hover:text-[#237E45]" strokeWidth={1.5} />
                </div>
              </div>

              {/* Bottom: Typography & CTA */}
              <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <h3 className="text-sm sm:text-lg font-medium text-white/90 mb-1 sm:mb-2">{cat.label}</h3>
                <p className="text-[10px] sm:text-sm text-[#A0AAA5] leading-relaxed line-clamp-2 mb-2 sm:mb-4">
                  {cat.desc}
                </p>
                <div className="hidden sm:flex items-center gap-1.5 text-[14px] font-medium text-[#237E45]/90 group-hover:text-[#237E45] transition-colors duration-300">
                  Explore {cat.label.split(' ')[0].toLowerCase()} <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center mt-2">
          <button 
            onClick={() => navigate('/app/marketplace')}
            className="px-6 py-3 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-2 group"
          >
            View more options <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── 6. CREDIT INTELLIGENCE ─────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-5 mt-8">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#237E45]/70 mb-1">Your Credit Intelligence</h2>
          <h3 className="text-[26px] font-medium text-white">Smarter insights. Maximum rewards.</h3>
          <p className="text-[14px] text-white/50 mt-1">AI-powered intelligence to help you choose, compare and use your cards the right way.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Find my best card */}
          <button 
            onClick={() => navigate('/app/credit/recommend')}
            className="group relative flex flex-col items-start text-left p-6 h-[220px] rounded-[24px] bg-[#07120D] border border-[#237E45]/10 hover:bg-[#081A12] transition-colors duration-300 overflow-hidden"
          >
            {/* Visual: Subtle radial signal */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500"
              style={{ background: 'radial-gradient(circle at 20% 20%, rgba(25,184,106,0.15) 0%, transparent 50%)' }}
            />
            
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full border border-[#237E45]/20 flex items-center justify-center mb-4">
                <Search className="w-4 h-4 text-[#237E45]" strokeWidth={1.5} />
              </div>
              <h4 className="text-[20px] lg:text-[22px] font-medium text-white mb-2 leading-none">Find my best card</h4>
              <p className="text-[14px] text-white/50 leading-relaxed pr-4">Analyze your spending to find the card that gives you the most value.</p>
            </div>
            
            <div className="relative z-10 mt-auto flex items-center gap-1.5 text-[13px] text-[#237E45] transition-transform duration-300 group-hover:translate-x-1">
              Find your best card <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 2: Compare my cards */}
          <button 
            onClick={() => navigate('/app/wallet')}
            className="group relative flex flex-col items-start text-left p-6 h-[220px] rounded-[24px] bg-[#07120D] border border-[#237E45]/10 hover:bg-[#081A12] transition-colors duration-300 overflow-hidden"
          >
            {/* Visual: Overlapping card outlines */}
            <div className="absolute right-0 bottom-0 pointer-events-none w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity duration-500 overflow-hidden">
              <div className="absolute right-4 bottom-4 w-24 h-16 border border-[#237E45]/30 rounded-xl rotate-[-10deg]" />
              <div className="absolute -right-2 -bottom-2 w-24 h-16 border border-[#237E45]/50 rounded-xl rotate-[5deg] bg-[#050806]/50 backdrop-blur-[1px]" />
            </div>

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full border border-[#237E45]/20 flex items-center justify-center mb-4">
                <Layers className="w-4 h-4 text-[#237E45]" strokeWidth={1.5} />
              </div>
              <h4 className="text-[20px] lg:text-[22px] font-medium text-white mb-2 leading-none">Compare my cards</h4>
              <p className="text-[14px] text-white/50 leading-relaxed pr-4">Compare the cards already in your wallet and see which performs better.</p>
            </div>
            
            <div className="relative z-10 mt-auto flex items-center gap-1.5 text-[13px] text-[#237E45] transition-transform duration-300 group-hover:translate-x-1">
              Compare now <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 3: Which card should I use? */}
          <button 
            onClick={() => navigate('/app/wallet')}
            className="group relative flex flex-col items-start text-left p-6 h-[220px] rounded-[24px] bg-[#07120D] border border-[#237E45]/10 hover:bg-[#081A12] transition-colors duration-300 overflow-hidden"
          >
            {/* Visual: Transaction line signal path */}
            <div className="absolute right-4 bottom-8 pointer-events-none opacity-20 group-hover:opacity-50 transition-opacity duration-500">
              <svg className="w-24 h-12" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 30 Q 30 0, 60 20 T 100 10" stroke="#237E45" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
                <circle cx="100" cy="10" r="3" fill="#237E45" />
                <circle cx="100" cy="10" r="6" fill="#237E45" fillOpacity="0.2" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full border border-[#237E45]/20 flex items-center justify-center mb-4">
                <CreditCard className="w-4 h-4 text-[#237E45]" strokeWidth={1.5} />
              </div>
              <h4 className="text-[20px] lg:text-[22px] font-medium text-white mb-2 leading-none">Which card should I use?</h4>
              <p className="text-[14px] text-white/50 leading-relaxed pr-4">Find the optimal card for a specific transaction.</p>
            </div>
            
            <div className="relative z-10 mt-auto flex items-center gap-1.5 text-[13px] text-[#237E45] transition-transform duration-300 group-hover:translate-x-1">
              Get recommendation <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </section>

      {/* ── 7. NEXT FOR YOU ─────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col gap-2 mt-2">
        <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 mb-1">Next for you</h2>
        
        <div className="flex flex-col w-full max-w-2xl bg-[#07120D] border border-white/[0.04] rounded-2xl overflow-hidden">
          {[
            { id: 1, text: `Review your ${userCards.length} active cards` },
            { id: 2, text: 'Upcoming bill in 4 days' },
            { id: 3, text: `₹2,450 in rewards currently unused` },
          ].map((action, i, arr) => (
            <button 
              key={action.id}
              className={cn(
                "group flex items-center justify-between px-5 py-3.5 transition-all duration-300 hover:bg-white/[0.02]",
                i !== arr.length - 1 ? "border-b border-white/[0.04]" : ""
              )}
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-4 h-4 text-white/20 group-hover:text-[#237E45] transition-colors duration-300" />
                <span className="text-[13px] font-medium text-white/70 group-hover:text-white transition-colors duration-300">
                  {action.text}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[#237E45] transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
            </button>
          ))}
        </div>
      </section>

    </PageContainer>
  );
}
