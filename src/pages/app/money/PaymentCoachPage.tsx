import React, { useState } from 'react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { PaymentDecisionEngine, PaymentContext, PaymentRecommendation } from '../../../features/money/engines/PaymentDecisionEngine';
import { PageContainer } from '../../../components/shared/PageContainer';

export default function PaymentCoachPage() {
  const { userCards, creditAccounts } = useDashboardStore();
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') !== null || import.meta.env.VITE_USE_DEMO_DATA === 'true';
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [merchantType, setMerchantType] = useState<'P2M' | 'P2P'>('P2M');
  const [result, setResult] = useState<PaymentRecommendation | null>(null);

  const categories = ['Food & Dining', 'Shopping', 'Transport', 'Travel', 'Bills & Utilities', 'Entertainment'];

  const handleAnalyze = () => {
    if (!amount) return;
    
    const context: PaymentContext = {
      amount: parseFloat(amount),
      merchant: merchant || 'Unknown Merchant',
      category: merchantType === 'P2P' ? 'P2P Transfers' : category,
      merchantType,
    };

    const recommendation = PaymentDecisionEngine.evaluate(context, userCards, creditAccounts, isDemoMode);
    setResult(recommendation);
  };

  const getInstrumentName = (id: string) => {
    if (id === 'bank_upi') return 'Bank Account (UPI)';
    const card = userCards.find(c => c.id === id);
    return card ? card.name : 'Unknown';
  };

  return (
    <PageContainer title="Payment Coach" className="pb-safe max-w-3xl mx-auto">
      <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-xl font-display font-medium text-gray-900 mb-6">About to pay?</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 block">Amount (₹)</label>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl font-display border-b border-gray-200 focus:border-gray-900 focus:ring-0 px-0 py-2 bg-transparent outline-none transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                className={`p-3 rounded-2xl border font-medium text-sm transition-colors ${merchantType === 'P2M' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 bg-white'}`}
                onClick={() => setMerchantType('P2M')}
              >
                Merchant (P2M)
              </button>
              <button 
                className={`p-3 rounded-2xl border font-medium text-sm transition-colors ${merchantType === 'P2P' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 bg-white'}`}
                onClick={() => setMerchantType('P2P')}
              >
                Friend (P2P)
              </button>
            </div>

            {merchantType === 'P2M' && (
              <>
                <div>
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 block">Merchant Name (Optional)</label>
                  <input 
                    type="text" 
                    value={merchant}
                    onChange={e => setMerchant(e.target.value)}
                    placeholder="e.g. Zomato"
                    className="w-full text-lg border-b border-gray-200 focus:border-gray-900 focus:ring-0 px-0 py-2 bg-transparent outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 block">Category</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full text-lg border-b border-gray-200 focus:border-gray-900 focus:ring-0 px-0 py-2 bg-transparent outline-none transition-colors"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}

            <button 
              onClick={handleAnalyze}
              disabled={!amount}
              className="w-full mt-6 bg-emerald-600 text-white font-medium py-3 rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Analyze Payment
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-lg font-medium text-gray-900">Recommendation</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded">
                {result.source}
              </span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Recommended</p>
              <p className="text-xl font-medium text-gray-900">{getInstrumentName(result.recommendedMethodId)}</p>
              
              {result.estimatedRewardValue && result.estimatedRewardValue > 0 ? (
                <p className="text-sm font-medium text-emerald-600 mt-2">
                  Estimated {result.source} Reward: ₹{result.estimatedRewardValue.toFixed(0)}
                </p>
              ) : null}
            </div>

            <p className="text-gray-700 text-sm mb-4 leading-relaxed">{result.reason}</p>
            
            {result.warnings && result.warnings.length > 0 && (
              <div className="space-y-2 mb-4">
                {result.warnings.map((w, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 text-amber-900 text-sm rounded-xl border border-amber-100">
                    ⚠️ {w}
                  </div>
                ))}
              </div>
            )}

            {result.alternativeMethodId && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Alternative</p>
                <p className="text-sm font-medium text-gray-900">{getInstrumentName(result.alternativeMethodId)}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </PageContainer>
  );
}
