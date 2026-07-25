import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_BANKS, getBankBySlug, getCardsByBank } from '../../../lib/cards';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_BANKS.map((bank) => ({
    slug: bank.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bank = getBankBySlug(slug);

  if (!bank) {
    return { title: 'Bank Not Found | RenoCred' };
  }

  return {
    title: `${bank.name} Credit Cards Directory (2026) | RenoCred`,
    description: `Explore all ${bank.cardCount} credit cards issued by ${bank.name}. Compare annual fees, rewards, lounge access, and minimum income criteria.`,
    alternates: {
      canonical: `https://renocred.com/banks/${bank.id}`,
    },
  };
}

export default async function BankPage({ params }: PageProps) {
  const { slug } = await params;
  const bank = getBankBySlug(slug);

  if (!bank) {
    notFound();
  }

  const bankCards = getCardsByBank(bank.id);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
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
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/cards" className="hover:text-white">Cards</Link>
          <span>/</span>
          <span className="text-gray-200">{bank.name}</span>
        </nav>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          {bank.name} Credit Cards
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Showing all {bankCards.length} active credit cards offered by {bank.name}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankCards.map((card) => (
            <Link
              key={card.id}
              href={`/cards/${card.slug}`}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#5da08c]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-xs font-mono text-gray-400">{card.network}</span>
                <h3 className="text-lg font-bold text-white group-hover:text-[#5da08c] transition-colors mt-1 mb-2">
                  {card.name}
                </h3>
                <div className="space-y-1.5 text-xs text-gray-400 mb-4">
                  <p>• Base Rewards: <strong className="text-white">{card.baseRewardRate}%</strong></p>
                  <p>• Annual Fee: <strong className="text-white">{card.annualFee === 0 ? 'Lifetime Free' : `₹${card.annualFee}`}</strong></p>
                  <p>• Lounge Access: <strong className="text-white">{card.loungeAccess ?? 0} visits/yr</strong></p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#5da08c]">
                <span>View Card Breakdown</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
