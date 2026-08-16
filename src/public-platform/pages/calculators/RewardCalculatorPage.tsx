import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { getAllPublicCards, getFlagshipPublicCards } from '../../lib/cardKnowledgeGraph';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { Calculator, Sparkles, ArrowRight, Shield, RefreshCw } from 'lucide-react';

export function RewardCalculatorPage() {
  const cards = getFlagshipPublicCards();
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0].id);
  const [monthlySpend, setMonthlySpend] = useState<number>(50000);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  // Calculation Logic (Estimated base yield calculation)
  const isCashback = selectedCard.rewardType === 'cashback';
  const effectiveRate = selectedCard.annualFee >= 10000 ? 0.05 : isCashback ? 0.04 : 0.02;
  const estimatedMonthlyReward = Math.round(monthlySpend * effectiveRate);
  const estimatedAnnualReward = estimatedMonthlyReward * 12;
  const annualFee = selectedCard.annualFee;
  const estimatedNetAnnualValue = Math.max(0, estimatedAnnualReward - annualFee);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Calculators', item: '/calculators/credit-card-reward-calculator' },
    { name: 'Credit Card Reward Calculator', item: '/calculators/credit-card-reward-calculator' },
  ]);

  return (
    <div className="w-full relative min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500/30 font-sans">
      <SEO
        title="Credit Card Reward Calculator (2026) | Estimate Cashback & Points | RenoCred"
        description="Calculate your estimated monthly and annual reward earnings across Indian credit cards. Calculate net annual value after annual fee deductions."
        canonicalUrl="https://renocred.com/calculators/credit-card-reward-calculator"
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      {/* Hero Header */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider mb-4">
          <Calculator size={14} /> Public Utility Tool
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight mb-3">
          Credit Card <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Reward Calculator</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Input your estimated monthly spend to calculate projected reward earnings and net value after annual fees.
        </p>
      </section>

      {/* Calculator Interface */}
      <main className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl bg-[#0D120F] border border-white/10">
          {/* Left Inputs */}
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles size={18} className="text-emerald-400" />
              1. Input Spending Parameters
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Select Credit Card:
              </label>
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full bg-[#151515] border border-white/10 text-sm text-white rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cardName} ({c.issuer})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-300 uppercase tracking-wider">Estimated Monthly Spend:</span>
                <span className="text-emerald-400 font-mono text-base">₹{monthlySpend.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={500000}
                step={5000}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>₹5,000</span>
                <span>₹2,50,000</span>
                <span>₹5,00,000</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 space-y-1">
              <span className="font-semibold text-gray-300">Selected Card Details:</span>
              <p>Structure: {selectedCard.rewardRate}</p>
              <p>Annual Fee: {selectedCard.formattedAnnualFee}</p>
            </div>
          </div>

          {/* Right Calculated Output */}
          <div className="md:col-span-6 flex flex-col justify-between p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Calculator size={18} className="text-emerald-400" />
                2. Estimated Calculation Results
              </h2>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Monthly Reward Value:</span>
                  <span className="font-mono text-lg font-bold text-white">₹{estimatedMonthlyReward.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Gross Annual Rewards:</span>
                  <span className="font-mono text-lg font-bold text-emerald-400">₹{estimatedAnnualReward.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Deducted Annual Fee:</span>
                  <span className="font-mono text-sm font-semibold text-red-400">- ₹{annualFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Estimated Net Annual Yield:</span>
                  <span className="font-mono text-2xl font-bold text-emerald-400">₹{estimatedNetAnnualValue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/app"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95"
              >
                <span>Optimize Portfolio in RenoCred</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Estimation Disclaimer */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">Calculator Disclaimer & Assumptions</p>
          <p>
            Calculated figures are estimates based on standard reward multipliers. Actual payouts depend on category spend breakdowns, portal multipliers (e.g. SmartBuy), reward redemption choices, and monthly capping policies.
          </p>
        </div>
      </main>
    </div>
  );
}
