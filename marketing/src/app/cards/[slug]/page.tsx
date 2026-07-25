import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_CARDS, getCardBySlug } from '../../../lib/cards';
import { FinancialProductSchema, FAQSchema } from '../../../components/StructuredData';
import { Shield, Check, X, Award, Zap, ChevronRight, HelpCircle, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_CARDS.map((card) => ({
    slug: card.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) {
    return {
      title: 'Card Not Found | RenoCred',
    };
  }

  const title = `${card.name} Review 2026: Fees, Rewards & Eligibility | RenoCred`;
  const description = `Complete breakdown of ${card.name} by ${card.bank}. Annual fee ₹${card.annualFee}, ${card.baseRewardRate}% base rewards, ${card.loungeAccess ?? 0} lounge visits/year. Is it worth it? Read RenoCred's data-backed analysis.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://renocred.com/cards/${card.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://renocred.com/cards/${card.slug}`,
      siteName: 'RenoCred',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) {
    notFound();
  }

  const faqs = [
    {
      question: `Is the ${card.name} a lifetime free credit card?`,
      answer: card.annualFee === 0
        ? `Yes, the ${card.name} is a 100% Lifetime Free credit card with ₹0 annual fee.`
        : `No. The ${card.name} has an annual fee of ₹${card.annualFee.toLocaleString('en-IN')}.${card.feeWaiverSpend ? ` However, the fee is waived if you spend at least ₹${card.feeWaiverSpend.toLocaleString('en-IN')} in a year.` : ''}`,
    },
    {
      question: `Does ${card.name} offer airport lounge access?`,
      answer: (card.loungeAccess ?? 0) > 0
        ? `Yes! The ${card.name} provides ${card.loungeAccess} complimentary airport lounge access visits per year.`
        : `No, the ${card.name} does not include complimentary airport lounge access.`,
    },
    {
      question: `What is the minimum income required for ${card.name}?`,
      answer: `The minimum recommended annual income to apply for ${card.name} is ₹${card.minIncome.toLocaleString('en-IN')}/year with a minimum CIBIL credit score of ${card.minCibil}.`,
    },
    {
      question: `What is the base reward rate of ${card.name}?`,
      answer: `The ${card.name} earns a base reward rate of ${card.baseRewardRate}% on general spend, with higher rates up to ${Math.max(...card.rewards.map(r => r.rate), card.baseRewardRate)}% on specific categories.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-[#5da08c]/30">
      <FinancialProductSchema card={card} />
      <FAQSchema items={faqs} />

      {/* Navigation Header */}
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
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/cards" className="hover:text-white">Cards</Link>
          <span>/</span>
          <span className="text-gray-200">{card.name}</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          {card.name} Review (2026)
        </h1>

        {/* SECTION A: AEO Answer-First Box (First 150 Words) */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111A24] to-[#0F1722] border border-[#5da08c]/30 mb-8">
          <div className="flex items-center gap-2 text-[#5da08c] text-xs font-bold uppercase tracking-wider mb-2">
            <Zap size={14} /> Quick Verdict &amp; Summary
          </div>
          <p className="text-base text-gray-200 leading-relaxed font-medium">
            The <strong>{card.name}</strong> issued by <strong>{card.bank}</strong> is a {card.annualFee === 0 ? 'lifetime free' : `₹${card.annualFee}/year`} {card.network} credit card best suited for cardholders earning over ₹{(card.minIncome / 100000).toFixed(1)}L/year. It delivers a base reward rate of <strong>{card.baseRewardRate}%</strong>, up to <strong>{Math.max(...card.rewards.map(r => r.rate), card.baseRewardRate)}%</strong> in top categories, and <strong>{card.loungeAccess ?? 0} complimentary airport lounge visits</strong> annually.
          </p>
        </div>

        {/* SECTION A: Quick Facts Table (LLM Extraction Target) */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-[#5da08c]" /> Key Specifications &amp; Facts
            </h2>
            <span className="text-xs text-gray-400">Verified July 2026</span>
          </div>
          <table className="w-full text-left text-sm text-gray-300">
            <tbody>
              <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                <th className="py-3.5 px-6 font-semibold text-gray-400 w-1/3">Bank / Issuer</th>
                <td className="py-3.5 px-6 font-medium text-white">{card.bank}</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                <th className="py-3.5 px-6 font-semibold text-gray-400">Payment Network</th>
                <td className="py-3.5 px-6 font-medium text-white">{card.network}</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                <th className="py-3.5 px-6 font-semibold text-gray-400">Annual Fee</th>
                <td className="py-3.5 px-6 font-medium text-[#5da08c]">
                  {card.annualFee === 0 ? 'Lifetime Free (₹0)' : `₹${card.annualFee.toLocaleString('en-IN')}`}
                </td>
              </tr>
              {card.feeWaiverSpend && (
                <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                  <th className="py-3.5 px-6 font-semibold text-gray-400">Fee Waiver Milestone</th>
                  <td className="py-3.5 px-6 font-medium text-white">Spend ₹{card.feeWaiverSpend.toLocaleString('en-IN')}/year</td>
                </tr>
              )}
              <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                <th className="py-3.5 px-6 font-semibold text-gray-400">Base Reward Rate</th>
                <td className="py-3.5 px-6 font-medium text-white">{card.baseRewardRate}%</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                <th className="py-3.5 px-6 font-semibold text-gray-400">Airport Lounge Access</th>
                <td className="py-3.5 px-6 font-medium text-white">{card.loungeAccess ?? 0} visits / year</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                <th className="py-3.5 px-6 font-semibold text-gray-400">Min Annual Income</th>
                <td className="py-3.5 px-6 font-medium text-white">₹{card.minIncome.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <th className="py-3.5 px-6 font-semibold text-gray-400">Min CIBIL Score</th>
                <td className="py-3.5 px-6 font-medium text-white">{card.minCibil}+</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION A: Category Reward Breakdown */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Reward Rates by Spending Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {card.rewards.map((r, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span className="text-sm font-semibold capitalize text-gray-300">{r.category}</span>
                <span className="text-base font-bold text-[#5da08c]">{r.rate}% Cashback</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION A: Pros & Cons */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2 mb-4">
              <Check size={18} /> Card Highlights &amp; Pros
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {card.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{h}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Base cashback rate of {card.baseRewardRate}% across all general transactions.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2 mb-4">
              <X size={18} /> Things to Keep in Mind
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {card.annualFee > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Annual fee of ₹{card.annualFee} applies if waiver threshold is not met.</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Requires minimum CIBIL score of {card.minCibil} for guaranteed approval.</span>
              </li>
              {(card.loungeAccess ?? 0) === 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>No complimentary airport lounge access included.</span>
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* SECTION A: FAQ Section */}
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
