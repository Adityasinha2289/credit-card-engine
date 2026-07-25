import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_CARDS, getBestCardsForCategory, getTopLoungeCards, getLifetimeFreeCards, CardData } from '../../../lib/cards';
import { FAQSchema } from '../../../components/StructuredData';
import { Award, Check, Zap, ArrowRight, HelpCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_CONFIG: Record<string, { title: string; subtitle: string; fetcher: () => CardData[]; categoryName: string }> = {
  'travel-cards': {
    title: 'Best Travel Credit Cards in India (2026)',
    subtitle: 'Maximize flight discounts, hotel rewards, lounge access, and forex savings.',
    categoryName: 'travel',
    fetcher: () => getBestCardsForCategory('travel', 10),
  },
  'cashback-cards': {
    title: 'Best Cashback Credit Cards in India (2026)',
    subtitle: 'Direct statement cashback on online shopping, utility bills, and food delivery.',
    categoryName: 'cashback',
    fetcher: () => getBestCardsForCategory('shopping', 10),
  },
  'fuel-cards': {
    title: 'Best Fuel Credit Cards in India (2026)',
    subtitle: 'Save up to 5% on petrol & diesel spending at HPCL, BPCL, and IndianOil.',
    categoryName: 'fuel',
    fetcher: () => getBestCardsForCategory('fuel', 10),
  },
  'lounge-access-cards': {
    title: 'Best Airport Lounge Access Credit Cards (2026)',
    subtitle: 'Cards with maximum complimentary domestic and international lounge visits.',
    categoryName: 'lounge access',
    fetcher: () => getTopLoungeCards(10),
  },
  'lifetime-free-cards': {
    title: 'Best Lifetime Free Credit Cards in India (2026)',
    subtitle: 'Zero annual fee forever with great baseline cashback and rewards.',
    categoryName: 'lifetime free',
    fetcher: () => getLifetimeFreeCards().slice(0, 10),
  },
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_CONFIG).map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    return { title: 'Category Not Found | RenoCred' };
  }

  return {
    title: `${config.title} | RenoCred`,
    description: `${config.subtitle} Ranked and analyzed using RenoCred's Taqdeer scoring engine across 140+ cards.`,
    alternates: {
      canonical: `https://renocred.com/best/${category}`,
    },
  };
}

export default async function BestCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const config = CATEGORY_CONFIG[category];

  if (!config) {
    notFound();
  }

  const cards = config.fetcher();
  const topPick = cards[0];

  const faqs = [
    {
      question: `What is the #1 best card for ${config.categoryName}?`,
      answer: topPick
        ? `Based on RenoCred's Taqdeer dataset analysis, the ${topPick.name} by ${topPick.bank} ranks #1 for ${config.categoryName} with an annual fee of ₹${topPick.annualFee}.`
        : `Check our updated rankings above for the best choices.`,
    },
    {
      question: `How are these ${config.categoryName} credit cards ranked?`,
      answer: `RenoCred ranks cards using an objective data model that evaluates effective reward percentage, fee-to-benefit ratio, waiver spend thresholds, and eligibility limits.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-[#5da08c]/30">
      <FAQSchema items={faqs} />

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-[#5da08c]">renocred</span>
          </Link>
          <Link
            href="/app"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-[#5da08c] text-black hover:bg-[#4d8675] transition-colors"
          >
            Open App →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          {config.title}
        </h1>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          {config.subtitle}
        </p>

        {/* SECTION A: AEO Top Pick Summary Box */}
        {topPick && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111A24] to-[#0F1722] border border-[#5da08c]/40 mb-10">
            <div className="flex items-center gap-2 text-[#5da08c] text-xs font-bold uppercase tracking-wider mb-2">
              <Award size={16} /> Top Recommendation
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{topPick.name}</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Overall #1 choice for {config.categoryName}. Offers {topPick.baseRewardRate}% base rewards, {topPick.loungeAccess ?? 0} lounge visits/year, and an annual fee of {topPick.annualFee === 0 ? '₹0 (Lifetime Free)' : `₹${topPick.annualFee}`}.
            </p>
            <Link
              href={`/cards/${topPick.slug}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-black bg-[#5da08c] px-4 py-2 rounded-xl hover:bg-[#4d8675] transition-colors"
            >
              Read Full Breakdown <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* SECTION A: Comparison Matrix Table */}
        <div className="mb-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Ranked Comparison Table</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/[0.04] text-xs font-bold uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Rank &amp; Card</th>
                  <th className="py-3.5 px-4">Annual Fee</th>
                  <th className="py-3.5 px-4">Base Reward</th>
                  <th className="py-3.5 px-4">Lounge</th>
                  <th className="py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card, index) => (
                  <tr key={card.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <span className="text-[#5da08c] font-bold mr-2">#{index + 1}</span>
                      {card.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {card.annualFee === 0 ? <span className="text-[#5da08c] font-semibold">Free</span> : `₹${card.annualFee}`}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">{card.baseRewardRate}%</td>
                    <td className="py-3.5 px-4">{card.loungeAccess ?? 0} / yr</td>
                    <td className="py-3.5 px-4">
                      <Link href={`/cards/${card.slug}`} className="text-xs text-[#5da08c] font-bold hover:underline">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION A: FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle size={22} className="text-[#5da08c]" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="text-base font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Methodology Attribution */}
        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-gray-500 flex justify-between items-center">
          <span>Evaluated using <strong>RenoCred Taqdeer Scoring Engine</strong></span>
          <span>Last Verified: July 2026</span>
        </div>
      </main>
    </div>
  );
}
