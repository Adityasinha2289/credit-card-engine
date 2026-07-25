import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import merchantsData from '../../../data/merchants.json';
import { getBestCardsForCategory, CardData } from '../../../lib/cards';
import { FAQSchema } from '../../../components/StructuredData';
import { ShoppingBag, Award, ArrowRight, HelpCircle, Check, Zap } from 'lucide-react';

interface Merchant {
  slug: string;
  name: string;
  category: string;
  description: string;
}

const MERCHANTS: Merchant[] = merchantsData as Merchant[];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MERCHANTS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const merchant = MERCHANTS.find((m) => m.slug === slug);

  if (!merchant) {
    return { title: 'Merchant Not Found | RenoCred' };
  }

  const title = `Best Credit Card for ${merchant.name} (2026 Rewards & Cashback) | RenoCred`;
  const description = `Find out which credit card gives maximum cashback and reward points at ${merchant.name}. Analyzed across 140+ cards using RenoCred's Taqdeer engine.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://renocred.com/merchants/${merchant.slug}`,
    },
  };
}

export default async function MerchantPage({ params }: PageProps) {
  const { slug } = await params;
  const merchant = MERCHANTS.find((m) => m.slug === slug);

  if (!merchant) {
    notFound();
  }

  const bestCards = getBestCardsForCategory(merchant.category, 6);
  const topCard = bestCards[0];

  const faqs = [
    {
      question: `Which is the #1 credit card to use at ${merchant.name}?`,
      answer: topPickAnswer(merchant, topCard),
    },
    {
      question: `How much cashback can I earn at ${merchant.name}?`,
      answer: `Depending on the card you select, you can earn between ${topCard?.baseRewardRate ?? 1}% to ${Math.max(...(topCard?.rewards.map(r => r.rate) ?? [5]))}% back on your ${merchant.name} transactions.`,
    },
    {
      question: `Are there annual fee waivers available on these cards?`,
      answer: `Yes, many top choices feature annual fee waivers when crossing spending thresholds ranging from ₹25,000 to ₹3,00,000 per year.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-[#5da08c]/30">
      <FAQSchema items={faqs} />

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
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="hover:text-white capitalize">{merchant.category}</span>
          <span>/</span>
          <span className="text-gray-200">{merchant.name}</span>
        </nav>

        <span className="text-xs font-bold text-[#5da08c] uppercase tracking-widest px-3 py-1 rounded-full bg-[#5da08c]/10 border border-[#5da08c]/20">
          Merchant Spend Intelligence
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-4 mb-4">
          Best Credit Card for {merchant.name}
        </h1>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          {merchant.description} Maximize your cashback and points on every {merchant.name} transaction.
        </p>

        {/* SECTION A: AEO Answer-First Box */}
        {topCard && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111A24] to-[#0F1722] border border-[#5da08c]/40 mb-10">
            <div className="flex items-center gap-2 text-[#5da08c] text-xs font-bold uppercase tracking-wider mb-2">
              <Award size={16} /> #1 Recommended Card for {merchant.name}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{topCard.name}</h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed font-medium">
              The <strong>{topCard.name}</strong> by {topCard.bank} is the top recommended card for <strong>{merchant.name}</strong>. It offers high reward rates for {merchant.category} spends with an annual fee of {topCard.annualFee === 0 ? '₹0 (Lifetime Free)' : `₹${topCard.annualFee}`}.
            </p>
            <Link
              href={`/cards/${topCard.slug}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-black bg-[#5da08c] px-4 py-2 rounded-xl hover:bg-[#4d8675] transition-colors"
            >
              View Full Card Details <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* SECTION A: Ranked Merchant Options Table */}
        <div className="mb-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Top Cards Ranked for {merchant.name}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/[0.04] text-xs font-bold uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Rank &amp; Card</th>
                  <th className="py-3.5 px-4">Bank</th>
                  <th className="py-3.5 px-4">Annual Fee</th>
                  <th className="py-3.5 px-4">Reward Rate</th>
                  <th className="py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {bestCards.map((card, index) => (
                  <tr key={card.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <span className="text-[#5da08c] font-bold mr-2">#{index + 1}</span>
                      {card.name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{card.bank}</td>
                    <td className="py-3.5 px-4">
                      {card.annualFee === 0 ? <span className="text-[#5da08c] font-semibold">Free</span> : `₹${card.annualFee}`}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#5da08c]">{card.baseRewardRate}% Base</td>
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

        {/* FAQs */}
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
      </main>
    </div>
  );
}

function topPickAnswer(merchant: Merchant, topCard?: CardData): string {
  if (!topCard) return `Check our card directory for recommendations.`;
  return `The ${topCard.name} is the #1 recommended credit card for purchases at ${merchant.name}. It provides excellent reward multipliers on ${merchant.category} expenses.`;
}
