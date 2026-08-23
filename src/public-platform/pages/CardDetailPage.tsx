import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { 
  getCardBySlug, 
  getAllPublicCards, 
  getCardsByIssuer 
} from '../lib/cardKnowledgeGraph';
import { 
  getCreditCardProductSchema, 
  getBreadcrumbSchema, 
  getFAQPageSchema 
} from '../lib/schemaBuilders';
import { CreditCard as PhysicalCard } from '../../features/cards/components/CreditCard';
import { 
  Shield, Sparkles, Award, Plane, Zap, CheckCircle2, 
  Building2, CreditCard, ChevronRight, HelpCircle, ArrowRight 
} from 'lucide-react';
import { useState } from 'react';

export function CardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const card = slug ? getCardBySlug(slug) : undefined;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!card) {
    return <Navigate to="/cards" replace />;
  }

  const relatedCards = getCardsByIssuer(card.issuer).filter((c) => c.id !== card.id).slice(0, 3);
  const allCards = getAllPublicCards();
  const sameCategoryCards = allCards.filter((c) => c.id !== card.id && c.categories.some((cat) => card.categories.includes(cat))).slice(0, 3);

  // Generate FAQs for FAQPage Schema & Accordion
  const faqs = [
    {
      question: `What is the annual fee for ${card.cardName}?`,
      answer: `The annual fee for ${card.cardName} is ${card.formattedAnnualFee}. The joining fee is ${card.formattedJoiningFee}.`,
    },
    {
      question: `What is the reward rate on ${card.cardName}?`,
      answer: `The reward structure for ${card.cardName} is: ${card.rewardRate}.`,
    },
    {
      question: `Does ${card.cardName} offer lounge access?`,
      answer: `Yes, ${card.cardName} offers: ${card.loungeAccess}.`,
    },
    {
      question: `What is the minimum income requirement for ${card.cardName}?`,
      answer: card.eligibility?.minSalary
        ? `The minimum recommended monthly income for ${card.cardName} is ₹${card.eligibility.minSalary.toLocaleString('en-IN')}/month.`
        : `Applicants must meet ${card.issuer}'s standard credit card eligibility criteria.`,
    },
  ];

  // FinancialProduct Schema
  const productSchema = getCreditCardProductSchema({
    name: card.cardName,
    issuer: card.issuer,
    annualFee: card.annualFee,
    joiningFee: card.joiningFee,
    rewardRate: card.rewardRate,
    network: card.network,
    perksSummary: card.topBenefit,
  });

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Credit Cards Directory', item: '/cards' },
    { name: card.cardName, item: `/cards/${card.slug}` },
  ]);

  // FAQ Schema
  const faqSchema = getFAQPageSchema(faqs);

  return (
    <div className="w-full relative min-h-[100dvh] bg-[#0A0A0A] text-white selection:bg-emerald-500/30">
      <SEO
        title={`${card.cardName} Rewards, Fees & Benefits (2026) | RenoCred`}
        description={`Detailed breakdown of ${card.cardName} by ${card.issuer}. Reward rate: ${card.rewardRate}. Annual fee: ${card.formattedAnnualFee}. Lounge access: ${card.loungeAccess}.`}
        canonicalUrl={`https://renocred.com/cards/${card.slug}`}
        schemaData={[productSchema, breadcrumbSchema, faqSchema]}
      />

      {/* Hero Header */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link to="/" className="hover:text-emerald-400 transition-colors shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <Link to="/cards" className="hover:text-emerald-400 transition-colors shrink-0">Credit Cards</Link>
          <span className="shrink-0">/</span>
          <span className="text-white font-medium truncate">{card.cardName}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Card Render */}
          <div className="md:col-span-5 flex justify-center">
            <PhysicalCard
              card={{
                id: card.id,
                pan: '•••• •••• •••• 8888',
                cardholderName: 'VERIFIED ENTITY',
                expiry: '12/29',
                network: card.network.toLowerCase() as any,
                bank: card.issuer,
                status: 'active',
                availableCredit: card.annualFee * 10,
                creditLimit: card.annualFee * 10,
                label: card.cardName,
                gradientFrom: '#0D2B1D',
                gradientTo: '#1A4D36',
              }}
              variant="wallet"
            />
          </div>

          {/* Right Column: Title & Key Badges */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                {card.issuer}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 uppercase tracking-wider">
                {card.network}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 uppercase tracking-wider">
                {card.rewardType}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              {card.cardName}
            </h1>

            <p className="text-lg text-emerald-400 font-medium leading-relaxed">
              {card.topBenefit}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-gray-400 block uppercase tracking-wider">Annual Fee</span>
                <span className="text-xl font-bold text-white font-mono">{card.formattedAnnualFee}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase tracking-wider">Joining Fee</span>
                <span className="text-xl font-bold text-white font-mono">{card.formattedJoiningFee}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase tracking-wider">Forex Markup</span>
                <span className="text-xl font-bold text-white font-mono">{card.forexMarkup !== null ? `${card.forexMarkup}%` : 'Not Disclosed'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Section 1: Rewards & Benefits */}
        <section className="bg-[#0D120F] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Sparkles className="text-emerald-400" size={24} />
            Reward Rates & Performance
          </h2>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Base & Accelerated Structure</h3>
            <p className="text-base text-gray-200 leading-relaxed">{card.rewardRate}</p>
          </div>
        </section>

        {/* Section 2: Lounge & Travel Benefits */}
        <section className="bg-[#0D120F] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Plane className="text-emerald-400" size={24} />
            Lounge & Travel Perks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lounge Access</h3>
              <p className="text-sm font-medium text-white">{card.loungeAccess}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fuel Benefits</h3>
              <p className="text-sm font-medium text-white">{card.fuelBenefits}</p>
            </div>
          </div>
        </section>

        {/* Section 3: Milestone & Welcome Benefits */}
        <section className="bg-[#0D120F] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Award className="text-emerald-400" size={24} />
            Welcome & Milestone Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Welcome Privileges</h3>
              {card.welcomeBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Milestone Bonuses</h3>
              {card.milestoneBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Frequently Asked Questions (FAQ) */}
        <section className="bg-[#0D120F] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <HelpCircle className="text-emerald-400" size={24} />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 flex items-center justify-between text-left font-medium text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronRight size={18} className={`transform transition-transform ${isOpen ? 'rotate-90 text-emerald-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-sm text-gray-300 border-t border-white/5 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Related Cards Internal Linking */}
        {sameCategoryCards.length > 0 && (
          <section className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">Similar Credit Cards to Compare</h2>
                <p className="text-sm text-gray-400 mt-1">Explore comparable credit cards in the {card.categories[0] || 'rewards'} category</p>
              </div>
              <Link 
                to="/cards" 
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Browse directory <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {sameCategoryCards.map((c) => {
                const fakeLast4 = ((c.id.length * 13) % 9000 + 1000).toString();
                return (
                  <Link
                    key={c.id}
                    to={`/cards/${c.slug}`}
                    className="group relative rounded-2xl bg-[#0D120F] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col overflow-hidden hover:bg-white/[0.02]"
                  >
                    {/* 2D Card Graphic Container */}
                    <div className="p-6 pb-4 flex items-center justify-center relative bg-gradient-to-b from-white/[0.02] to-transparent">
                      {/* Subtle hover glow behind card */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-emerald-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="scale-90 group-hover:scale-95 group-hover:-translate-y-1 transition-transform duration-300 ease-out origin-center relative z-10 w-full flex justify-center">
                        <PhysicalCard
                          card={{
                            id: c.id,
                            pan: `•••• •••• •••• ${fakeLast4}`,
                            cardholderName: 'RENOCRED MEMBER',
                            expiry: '12/28',
                            network: c.network.toLowerCase() as any,
                            bank: c.issuer,
                            status: 'active',
                            availableCredit: 0,
                            creditLimit: 0,
                            label: c.cardName,
                          }}
                          variant="compact"
                        />
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="px-5 pb-5 pt-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">{c.issuer}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5 uppercase tracking-wider">{c.network}</span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">{c.cardName}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{c.topBenefit}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 mt-4 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Annual Fee</span>
                          <span className="font-semibold text-white">{c.formattedAnnualFee}</span>
                        </div>
                        <span className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-1 transition-transform font-medium">
                          View details <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
