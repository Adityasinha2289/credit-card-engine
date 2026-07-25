import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_CARDS, getCardBySlug } from '../../../lib/cards';
import { FAQSchema } from '../../../components/StructuredData';
import { Check, X, Award, HelpCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  // Sample popular card pairs for static generation
  const popularSlugs = [
    ['iob-platinum', 'indian-bank-rupay-platinum'],
    ['iob-classic', 'iob-platinum'],
  ];

  for (const [a, b] of popularSlugs) {
    params.push({ slug: `${a}-vs-${b}` });
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return { title: 'Comparison | RenoCred' };

  const cardA = getCardBySlug(parts[0]);
  const cardB = getCardBySlug(parts[1]);

  if (!cardA || !cardB) return { title: 'Comparison | RenoCred' };

  const title = `${cardA.name} vs ${cardB.name} Comparison (2026) | RenoCred`;
  const description = `Detailed side-by-side comparison of ${cardA.name} vs ${cardB.name}. Compare annual fees, rewards, lounge access, and minimum income criteria.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://renocred.com/compare/${slug}`,
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const parts = slug.split('-vs-');
  if (parts.length !== 2) notFound();

  const cardA = getCardBySlug(parts[0]);
  const cardB = getCardBySlug(parts[1]);

  if (!cardA || !cardB) notFound();

  const winner = cardA.baseRewardRate >= cardB.baseRewardRate ? cardA : cardB;

  const faqs = [
    {
      question: `Which card is better: ${cardA.name} or ${cardB.name}?`,
      answer: `The ${winner.name} offers a higher baseline reward rate (${winner.baseRewardRate}%) compared to ${winner === cardA ? cardB.name : cardA.name} (${winner === cardA ? cardB.baseRewardRate : cardA.baseRewardRate}%). However, your ideal choice depends on your specific spending habits and annual spend volume.`,
    },
    {
      question: `What is the fee difference between ${cardA.name} and ${cardB.name}?`,
      answer: `${cardA.name} has an annual fee of ₹${cardA.annualFee}, while ${cardB.name} has an annual fee of ₹${cardB.annualFee}.`,
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
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
          {cardA.name} <span className="text-[#5da08c]">vs</span> {cardB.name}
        </h1>

        {/* AEO Summary Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111A24] to-[#0F1722] border border-[#5da08c]/40 mb-10">
          <div className="flex items-center gap-2 text-[#5da08c] text-xs font-bold uppercase tracking-wider mb-2">
            <Award size={16} /> Comparison Summary
          </div>
          <p className="text-base text-gray-200 leading-relaxed font-medium">
            <strong>{winner.name}</strong> edges out as the better baseline choice due to its higher base reward rate of <strong>{winner.baseRewardRate}%</strong>. {cardA.name} carries an annual fee of ₹{cardA.annualFee}, whereas {cardB.name} carries an annual fee of ₹{cardB.annualFee}.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/[0.04] text-xs font-bold uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-4 px-6 w-1/3">Feature</th>
                  <th className="py-4 px-6 text-white text-base">{cardA.name}</th>
                  <th className="py-4 px-6 text-white text-base">{cardB.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <th className="py-3.5 px-6 font-semibold text-gray-400">Bank</th>
                  <td className="py-3.5 px-6 font-medium text-white">{cardA.bank}</td>
                  <td className="py-3.5 px-6 font-medium text-white">{cardB.bank}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <th className="py-3.5 px-6 font-semibold text-gray-400">Network</th>
                  <td className="py-3.5 px-6 font-medium text-white">{cardA.network}</td>
                  <td className="py-3.5 px-6 font-medium text-white">{cardB.network}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <th className="py-3.5 px-6 font-semibold text-gray-400">Annual Fee</th>
                  <td className="py-3.5 px-6 font-bold text-[#5da08c]">{cardA.annualFee === 0 ? 'Free' : `₹${cardA.annualFee}`}</td>
                  <td className="py-3.5 px-6 font-bold text-[#5da08c]">{cardB.annualFee === 0 ? 'Free' : `₹${cardB.annualFee}`}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <th className="py-3.5 px-6 font-semibold text-gray-400">Base Reward Rate</th>
                  <td className="py-3.5 px-6 font-medium text-white">{cardA.baseRewardRate}%</td>
                  <td className="py-3.5 px-6 font-medium text-white">{cardB.baseRewardRate}%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <th className="py-3.5 px-6 font-semibold text-gray-400">Airport Lounge Access</th>
                  <td className="py-3.5 px-6 font-medium text-white">{cardA.loungeAccess ?? 0} visits / yr</td>
                  <td className="py-3.5 px-6 font-medium text-white">{cardB.loungeAccess ?? 0} visits / yr</td>
                </tr>
                <tr className="border-b border-white/5">
                  <th className="py-3.5 px-6 font-semibold text-gray-400">Min Income</th>
                  <td className="py-3.5 px-6 font-medium text-white">₹{cardA.minIncome.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-6 font-medium text-white">₹{cardB.minIncome.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <th className="py-3.5 px-6 font-semibold text-gray-400">Min CIBIL</th>
                  <td className="py-3.5 px-6 font-medium text-white">{cardA.minCibil}+</td>
                  <td className="py-3.5 px-6 font-medium text-white">{cardB.minCibil}+</td>
                </tr>
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
