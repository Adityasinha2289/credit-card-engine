import { Metadata } from 'next';
import Link from 'next/link';
import { ALL_CARDS, ALL_BANKS } from '../../lib/cards';
import { CreditCard, Award, ArrowRight, ShieldCheck, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Credit Cards in India (2026 Directory) | RenoCred',
  description: 'Explore and compare 140+ Indian credit cards across HDFC, SBI, ICICI, Axis, and more. Filter by annual fee, lounge access, cashback, and rewards.',
  alternates: {
    canonical: 'https://renocred.com/cards',
  },
};

export default function CardsHubPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
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

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#5da08c] uppercase tracking-widest px-3 py-1 rounded-full bg-[#5da08c]/10 border border-[#5da08c]/20">
            Card Intelligence Directory
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-4 mb-4">
            Compare All {ALL_CARDS.length} Credit Cards in India
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Data-backed analysis across reward rates, annual fees, lounge access, and minimum eligibility criteria.
          </p>
        </div>

        {/* Bank Filters */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
            <Filter size={14} /> Filter by Bank
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_BANKS.map((bank) => (
              <Link
                key={bank.id}
                href={`/banks/${bank.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#5da08c]/50 text-xs font-semibold text-gray-300 hover:text-white transition-all"
              >
                {bank.name} <span className="text-gray-500">({bank.cardCount})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_CARDS.map((card) => (
            <Link
              key={card.id}
              href={`/cards/${card.slug}`}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#5da08c]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#5da08c] uppercase tracking-wider">{card.bank}</span>
                  <span className="text-xs text-gray-400 font-mono">{card.network}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#5da08c] transition-colors mb-2">
                  {card.name}
                </h3>
                <div className="space-y-1.5 text-xs text-gray-400 mb-4">
                  <p>• Base Rewards: <strong className="text-white">{card.baseRewardRate}%</strong></p>
                  <p>• Annual Fee: <strong className="text-white">{card.annualFee === 0 ? 'Lifetime Free' : `₹${card.annualFee}`}</strong></p>
                  <p>• Lounge Access: <strong className="text-white">{card.loungeAccess ?? 0} visits/yr</strong></p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#5da08c]">
                <span>View Full Analysis</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
