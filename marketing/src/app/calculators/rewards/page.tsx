'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ALL_CARDS, CardData } from '../../../lib/cards';
import { Calculator, Award, ArrowRight, RefreshCw } from 'lucide-react';

export default function RewardsCalculatorPage() {
  const [dining, setDining] = useState(10000);
  const [shopping, setShopping] = useState(15000);
  const [travel, setTravel] = useState(10000);
  const [groceries, setGroceries] = useState(10000);
  const [fuel, setFuel] = useState(5000);

  const totalMonthlySpend = dining + shopping + travel + groceries + fuel;
  const totalAnnualSpend = totalMonthlySpend * 12;

  // Calculate annual reward earnings for each card
  const calculatedCards = ALL_CARDS.map((card) => {
    const getRate = (cat: string) => card.rewards.find((r) => r.category === cat)?.rate ?? card.baseRewardRate;
    
    const monthlyReward = 
      (dining * getRate('dining')) / 100 +
      (shopping * getRate('shopping')) / 100 +
      (travel * getRate('travel')) / 100 +
      (groceries * getRate('groceries')) / 100 +
      (fuel * getRate('fuel')) / 100;

    const grossAnnualReward = monthlyReward * 12;
    const netAnnualReward = Math.max(0, grossAnnualReward - card.annualFee);

    return {
      card,
      grossAnnualReward,
      netAnnualReward,
      effectiveRate: ((grossAnnualReward / totalAnnualSpend) * 100).toFixed(1),
    };
  }).sort((a, b) => b.netAnnualReward - a.netAnnualReward).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-[#5da08c]/30">
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

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#5da08c] uppercase tracking-widest px-3 py-1 rounded-full bg-[#5da08c]/10 border border-[#5da08c]/20">
            Interactive Financial Tool
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-4 mb-3">
            Credit Card Rewards Calculator
          </h1>
          <p className="text-gray-400 text-base">
            Input your monthly spending pattern below to see which card delivers the maximum net reward value.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sliders Panel */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Calculator size={18} className="text-[#5da08c]" /> Monthly Spend Inputs
            </h2>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-300">Dining &amp; Food Delivery</span>
                <span className="text-[#5da08c]">₹{dining.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={dining}
                onChange={(e) => setDining(Number(e.target.value))}
                className="w-full accent-[#5da08c]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-300">Online Shopping</span>
                <span className="text-[#5da08c]">₹{shopping.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={shopping}
                onChange={(e) => setShopping(Number(e.target.value))}
                className="w-full accent-[#5da08c]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-300">Travel &amp; Flights</span>
                <span className="text-[#5da08c]">₹{travel.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={travel}
                onChange={(e) => setTravel(Number(e.target.value))}
                className="w-full accent-[#5da08c]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-300">Groceries &amp; Supermarket</span>
                <span className="text-[#5da08c]">₹{groceries.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={groceries}
                onChange={(e) => setGroceries(Number(e.target.value))}
                className="w-full accent-[#5da08c]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-300">Fuel &amp; Petrol</span>
                <span className="text-[#5da08c]">₹{fuel.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={1000}
                value={fuel}
                onChange={(e) => setFuel(Number(e.target.value))}
                className="w-full accent-[#5da08c]"
              />
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between text-sm font-bold">
              <span>Total Monthly Spend:</span>
              <span className="text-white">₹{totalMonthlySpend.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span>Top Cards Ranked for Your Spend Pattern</span>
              <span className="text-xs font-normal text-gray-400">Net Annual Value (after fee)</span>
            </h2>

            <div className="space-y-3">
              {calculatedCards.map(({ card, netAnnualReward, effectiveRate }, idx) => (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#5da08c]/40 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-[#5da08c]/10 text-[#5da08c] font-bold text-sm flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{card.name}</h3>
                      <p className="text-xs text-gray-400">
                        {card.bank} • Fee: {card.annualFee === 0 ? 'Free' : `₹${card.annualFee}`} • Effective Rate: <strong className="text-[#5da08c]">{effectiveRate}%</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-[#5da08c]">
                      +₹{Math.round(netAnnualReward).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                      / year net savings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
