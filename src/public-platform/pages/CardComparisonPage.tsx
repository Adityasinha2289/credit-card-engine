import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { 
  getComparisonPairBySlug, 
  getAllPublicCards 
} from '../lib/cardKnowledgeGraph';
import { 
  getBreadcrumbSchema, 
  getOrganizationSchema, 
  getWebSiteSchema 
} from '../lib/schemaBuilders';
import { CreditCard as PhysicalCard } from '../../features/cards/components/CreditCard';
import { 
  Scale, Sparkles, CheckCircle2, ArrowRight, Shield, 
  Award, HelpCircle, ExternalLink 
} from 'lucide-react';

export function CardComparisonPage() {
  const { pairSlug } = useParams<{ pairSlug: string }>();
  const pair = pairSlug ? getComparisonPairBySlug(pairSlug) : undefined;

  if (!pair) {
    return <Navigate to="/cards" replace />;
  }

  const { cardA, cardB, canonicalUrl, verdict } = pair;
  const fakeLast4A = ((cardA.id.length * 13) % 9000 + 1000).toString();
  const fakeLast4B = ((cardB.id.length * 13) % 9000 + 1000).toString();

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Card Comparisons', item: '/cards' },
    { name: `${cardA.cardName} vs ${cardB.cardName}`, item: `/compare/${pair.pairSlug}` },
  ]);

  return (
    <div className="w-full relative min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30 font-sans">
      <SEO
        title={`${cardA.cardName} vs ${cardB.cardName} Comparison (2026) | RenoCred`}
        description={`Compare ${cardA.cardName} and ${cardB.cardName} side-by-side. Analyze annual fees (${cardA.formattedAnnualFee} vs ${cardB.formattedAnnualFee}), reward rates, lounge access, and milestone perks.`}
        canonicalUrl={canonicalUrl}
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      {/* Hero Header */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400 mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link to="/" className="hover:text-emerald-400 transition-colors shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <Link to="/cards" className="hover:text-emerald-400 transition-colors shrink-0">Comparisons</Link>
          <span className="shrink-0">/</span>
          <span className="text-white font-medium truncate">{cardA.cardName} vs {cardB.cardName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              <Scale size={14} /> Head-to-Head Card Comparison
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              {cardA.cardName} <span className="text-gray-500 font-light">vs</span> {cardB.cardName}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
              Data-backed comparison evaluating annual fees, net reward rates, milestone bonuses, and lounge access thresholds.
            </p>
          </div>

          {/* 2D Visual Cards Showcase */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 items-center justify-center">
            <Link to={`/cards/${cardA.slug}`} className="group flex flex-col items-center">
              <div className="scale-90 sm:scale-100 group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-300 origin-center">
                <PhysicalCard
                  card={{
                    id: cardA.id,
                    pan: `•••• •••• •••• ${fakeLast4A}`,
                    cardholderName: 'RENOCRED MEMBER',
                    expiry: '12/28',
                    network: cardA.network.toLowerCase() as any,
                    bank: cardA.issuer,
                    status: 'active',
                    availableCredit: 0,
                    creditLimit: 0,
                    label: cardA.cardName,
                  }}
                  variant="compact"
                />
              </div>
              <span className="text-xs font-semibold text-emerald-400 mt-3 group-hover:underline flex items-center gap-1">
                {cardA.cardName} <ArrowRight size={10} />
              </span>
            </Link>

            <Link to={`/cards/${cardB.slug}`} className="group flex flex-col items-center">
              <div className="scale-90 sm:scale-100 group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-300 origin-center">
                <PhysicalCard
                  card={{
                    id: cardB.id,
                    pan: `•••• •••• •••• ${fakeLast4B}`,
                    cardholderName: 'RENOCRED MEMBER',
                    expiry: '12/28',
                    network: cardB.network.toLowerCase() as any,
                    bank: cardB.issuer,
                    status: 'active',
                    availableCredit: 0,
                    creditLimit: 0,
                    label: cardB.cardName,
                  }}
                  variant="compact"
                />
              </div>
              <span className="text-xs font-semibold text-teal-400 mt-3 group-hover:underline flex items-center gap-1">
                {cardB.cardName} <ArrowRight size={10} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <main className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10">
        {/* Quick Verdict Box */}
        <section className="p-6 rounded-2xl bg-[#0D120F] border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Sparkles size={18} />
            <span>Quick Verdict & Analytical Summary</span>
          </div>
          <p className="text-base text-gray-200 leading-relaxed font-medium">
            {verdict}
          </p>
        </section>

        {/* Factual Side-by-Side Comparison Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Scale className="text-emerald-400" size={22} />
            Feature Comparison Matrix
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0D120F]">
            <table className="w-full text-left text-sm text-gray-300 min-w-[650px]">
              <thead className="bg-white/5 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-6 w-1/3">Feature</th>
                  <th className="py-4 px-6 w-1/3 text-emerald-400">{cardA.cardName}</th>
                  <th className="py-4 px-6 w-1/3 text-teal-400">{cardB.cardName}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-gray-400">Issuer Bank</td>
                  <td className="py-4 px-6 text-white">{cardA.issuer}</td>
                  <td className="py-4 px-6 text-white">{cardB.issuer}</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-gray-400">Card Network</td>
                  <td className="py-4 px-6 text-white">{cardA.network}</td>
                  <td className="py-4 px-6 text-white">{cardB.network}</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-gray-400">Annual Fee</td>
                  <td className="py-4 px-6 text-white font-mono">{cardA.formattedAnnualFee}</td>
                  <td className="py-4 px-6 text-white font-mono">{cardB.formattedAnnualFee}</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-gray-400">Joining Fee</td>
                  <td className="py-4 px-6 text-white font-mono">{cardA.formattedJoiningFee}</td>
                  <td className="py-4 px-6 text-white font-mono">{cardB.formattedJoiningFee}</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-gray-400">Reward Structure</td>
                  <td className="py-4 px-6 text-emerald-400">{cardA.rewardRate}</td>
                  <td className="py-4 px-6 text-teal-400">{cardB.rewardRate}</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-gray-400">Lounge Access</td>
                  <td className="py-4 px-6 text-white">{cardA.loungeAccess}</td>
                  <td className="py-4 px-6 text-white">{cardB.loungeAccess}</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-gray-400">Forex Surcharge</td>
                  <td className="py-4 px-6 text-white font-mono">{cardA.forexMarkup}%</td>
                  <td className="py-4 px-6 text-white font-mono">{cardB.forexMarkup}%</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 text-gray-400">Fuel Surcharge Waiver</td>
                  <td className="py-4 px-6 text-white">{cardA.fuelBenefits}</td>
                  <td className="py-4 px-6 text-white">{cardB.fuelBenefits}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Who Should Choose Which Card? */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A Recommendation Profile */}
          <div className="p-6 rounded-2xl bg-[#0D120F] border border-emerald-500/20 space-y-4">
            <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={20} />
              Who Should Choose {cardA.cardName}?
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Primary focus: {cardA.topBenefit}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Users who spend across {cardA.categories.join(', ')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Prefers {cardA.issuer}'s digital ecosystem & rewards portal</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to={`/cards/${cardA.slug}`} className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
                View Full {cardA.cardName} Entity Profile <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card B Recommendation Profile */}
          <div className="p-6 rounded-2xl bg-[#0D120F] border border-teal-500/20 space-y-4">
            <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
              <CheckCircle2 size={20} />
              Who Should Choose {cardB.cardName}?
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>Primary focus: {cardB.topBenefit}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>Users who spend across {cardB.categories.join(', ')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>Prefers {cardB.issuer}'s rewards portal & fee waiver terms</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to={`/cards/${cardB.slug}`} className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1">
                View Full {cardB.cardName} Entity Profile <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* RenoCred Analysis Disclosure */}
        <section className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">RenoCred Factual & Analytical Disclosure</p>
          <p>
            Card terms, fees, and reward rates are verified against official bank schedule disclosures. RenoCred does not issue credit cards or guarantee card approvals.
          </p>
        </section>

        {/* Product Conversion CTA */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 text-center space-y-4">
          <h2 className="text-2xl font-display font-bold text-white">
            Calculate Net Reward Yield for Your Exact Spends
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            Use RenoCred's Taqdeer AI recommendation engine to simulate your exact monthly spending pattern against both cards.
          </p>
          <div className="pt-2">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-[0_0_25px_rgba(52,211,153,0.3)] active:scale-95"
            >
              <span>Simulate Spend Yield in RenoCred</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
