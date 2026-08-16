import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { getFlagshipPublicCards } from '../../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { Calculator, Sparkles, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

export function BreakEvenCalculatorPage() {
  const cards = getFlagshipPublicCards();
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0].id);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const annualFee = selectedCard.annualFee;
  // Estimate break-even spend required to recover annual fee via rewards
  const returnRate = selectedCard.annualFee >= 10000 ? 0.05 : 0.02;
  const breakEvenAnnualSpend = annualFee === 0 ? 0 : Math.round(annualFee / returnRate);
  const breakEvenMonthlySpend = Math.round(breakEvenAnnualSpend / 12);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Calculators', item: '/calculators/annual-fee-break-even' },
    { name: 'Annual Fee Break-Even Calculator', item: '/calculators/annual-fee-break-even' },
  ]);

  return (
    <div className="w-full relative min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30 font-sans">
      <SEO
        title="Credit Card Annual Fee Break-Even Calculator (2026) | RenoCred"
        description="Calculate the exact annual and monthly spending required to recover your credit card annual fee. Compare fee waiver thresholds across Indian credit cards."
        canonicalUrl="https://renocred.com/calculators/annual-fee-break-even"
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      {/* Hero Header */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider mb-4">
          <Calculator size={14} /> Public Utility Tool
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight mb-3">
          Annual Fee <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Break-Even Calculator</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Determine the spending required to offset your annual credit card fee through rewards and milestone waivers.
        </p>
      </section>

      {/* Calculator Main */}
      <main className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl bg-[#0D120F] border border-white/10">
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles size={18} className="text-emerald-400" />
              1. Select Card Entity
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Credit Card:
              </label>
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full bg-[#151515] border border-white/10 text-sm text-white rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cardName} ({c.formattedAnnualFee})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-gray-300">
              <span className="font-semibold text-emerald-400">Card Fee & Waiver Milestones:</span>
              <p>Annual Fee: {selectedCard.formattedAnnualFee}</p>
              <p>Milestone Waiver: {selectedCard.milestoneBenefits[0] || 'Standard fee terms'}</p>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col justify-between p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Calculator size={18} className="text-emerald-400" />
                2. Estimated Break-Even Spend
              </h2>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Annual Card Fee:</span>
                  <span className="font-mono text-base font-bold text-white">{selectedCard.formattedAnnualFee}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Required Monthly Break-Even Spend:</span>
                  <span className="font-mono text-lg font-bold text-emerald-400">₹{breakEvenMonthlySpend.toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Required Annual Break-Even Spend:</span>
                  <span className="font-mono text-2xl font-bold text-emerald-400">₹{breakEvenAnnualSpend.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/app"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95"
              >
                <span>Calculate Yield in RenoCred</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">Calculator Disclaimer & Assumptions</p>
          <p>
            Break-even estimates calculate reward value recovery based on standard category spend multipliers. Milestone annual fee waivers (e.g. ₹2L spend waiver) provide 100% fee recovery upon reaching the target spend threshold.
          </p>
        </div>
      </main>
    </div>
  );
}
