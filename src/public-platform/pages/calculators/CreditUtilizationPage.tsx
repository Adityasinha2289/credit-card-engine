import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { getBreadcrumbSchema, getOrganizationSchema, getWebSiteSchema } from '../../lib/schemaBuilders';
import { Calculator, Sparkles, ArrowRight, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

export function CreditUtilizationPage() {
  const [totalCreditLimit, setTotalCreditLimit] = useState<number>(300000);
  const [currentBalance, setCurrentBalance] = useState<number>(45000);

  const utilizationRatio = totalCreditLimit > 0 ? Math.round((currentBalance / totalCreditLimit) * 100) : 0;

  const isHealthy = utilizationRatio <= 30;
  const isModerate = utilizationRatio > 30 && utilizationRatio <= 50;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Calculators', item: '/calculators/credit-utilization' },
    { name: 'Credit Utilization Calculator', item: '/calculators/credit-utilization' },
  ]);

  return (
    <div className="w-full relative min-h-[100dvh] bg-[#0A0A0A] text-white selection:bg-emerald-500/30 font-sans">
      <SEO
        title="Credit Utilization Ratio Calculator (2026) | CIBIL Impact | RenoCred"
        description="Calculate your credit card utilization ratio percentage and understand its impact on your CIBIL score. Ideal credit utilization benchmark guide."
        canonicalUrl="https://renocred.com/calculators/credit-utilization"
        schemaData={[getOrganizationSchema(), getWebSiteSchema(), breadcrumbSchema]}
      />

      {/* Hero Header */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider mb-4">
          <Calculator size={14} /> Public Educational Tool
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight mb-3">
          Credit Utilization <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Calculator</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Calculate your credit card utilization ratio percentage and evaluate its impact on your CIBIL score.
        </p>
      </section>

      {/* Calculator Main */}
      <main className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl bg-[#0D120F] border border-white/10">
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles size={18} className="text-emerald-400" />
              1. Input Credit Parameters
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-300 uppercase tracking-wider">Total Credit Limit (All Cards):</span>
                <span className="text-white font-mono text-base">₹{totalCreditLimit.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={25000}
                value={totalCreditLimit}
                onChange={(e) => setTotalCreditLimit(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-white/10 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-300 uppercase tracking-wider">Current Total Outstanding Balance:</span>
                <span className="text-emerald-400 font-mono text-base">₹{currentBalance.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={totalCreditLimit}
                step={5000}
                value={currentBalance}
                onChange={(e) => setCurrentBalance(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-white/10 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col justify-between p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Calculator size={18} className="text-emerald-400" />
                2. Utilization Percentage & Status
              </h2>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Credit Limit:</span>
                  <span className="font-mono text-base font-bold text-white">₹{totalCreditLimit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Current Balance:</span>
                  <span className="font-mono text-base font-bold text-white">₹{currentBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Credit Utilization Ratio:</span>
                  <span className={`font-mono text-3xl font-bold ${isHealthy ? 'text-emerald-400' : isModerate ? 'text-yellow-400' : 'text-red-400'}`}>
                    {utilizationRatio}%
                  </span>
                </div>

                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isHealthy ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : isModerate ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                  {isHealthy ? (
                    <p className="flex items-center gap-2 font-medium">
                      <CheckCircle2 size={16} /> Optimal Ratio! Credit bureaus (CIBIL/Experian) favor utilization below 30%.
                    </p>
                  ) : isModerate ? (
                    <p className="flex items-center gap-2 font-medium">
                      <AlertTriangle size={16} /> Moderate Utilization (30%-50%). Consider making partial payments before bill generation.
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 font-medium">
                      <AlertTriangle size={16} /> High Utilization ({utilizationRatio}%). Ratios above 50% can lower your CIBIL score.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/app"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95"
              >
                <span>Track CIBIL & Spends in RenoCred</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">Educational Disclaimer</p>
          <p>
            Credit utilization accounts for approximately 30% of your total credit score calculation. This calculator provides educational estimates and does not guarantee exact credit score outcomes.
          </p>
        </div>
      </main>
    </div>
  );
}
