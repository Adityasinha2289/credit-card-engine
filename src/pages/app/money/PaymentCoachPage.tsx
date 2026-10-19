import { useState } from 'react';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { PaymentDecisionEngine, type PaymentContext, type PaymentRecommendation } from '../../../features/money/engines/PaymentDecisionEngine';
import type { SpendCategory } from '../../../features/finix/data/cardDataset';
import { useIsDemo } from '../../../features/demo/DemoAppProvider';
import { PageContainer } from '../../../components/shared/PageContainer';

const CATEGORIES: { value: SpendCategory | 'auto'; label: string }[] = [
  { value: 'auto', label: 'Detect from merchant' },
  { value: 'dining', label: 'Food & Dining' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'travel', label: 'Travel' },
  { value: 'transport', label: 'Transport' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'utilities', label: 'Bills & Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

const CONFIDENCE_LABEL: Record<string, string> = {
  EXACT: 'Exact',
  ESTIMATED: 'Estimate',
  LIMITED: 'Estimate',
  UNSUPPORTED: 'Low confidence',
};

export default function PaymentCoachPage() {
  const userCards = useDashboardStore((s) => s.userCards);
  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const transactions = useDashboardStore((s) => s.transactions);
  const isDemo = useIsDemo();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<SpendCategory | 'auto'>('auto');
  const [merchantType, setMerchantType] = useState<'P2M' | 'P2P'>('P2M');
  const [result, setResult] = useState<PaymentRecommendation | null>(null);

  const handleAnalyze = () => {
    const rupees = parseFloat(amount);
    if (!(rupees > 0)) return;

    const context: PaymentContext = {
      amount: rupees,
      merchant: merchant.trim(),
      category: category === 'auto' ? undefined : category,
      merchantType,
    };

    setResult(PaymentDecisionEngine.evaluate(context, userCards, creditAccounts, { isDemo, history: transactions }));
  };

  const getInstrumentName = (id: string) => {
    if (id === 'bank_upi') return 'Bank Account (UPI)';
    const card = userCards.find(c => c.id === id);
    return card ? (card.label || card.bank || 'Card') : 'Card';
  };

  return (
    <PageContainer eyebrow="Payment coach" title={<>Which card, <span className="italic">right now?</span></>} subtitle="Enter what you're about to pay and RenoCred ranks your cards by what each one earns on it." className="pb-safe max-w-3xl mx-auto">
      <div className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">About to pay?</h2>
          
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
                    onChange={e => setCategory(e.target.value as SpendCategory | 'auto')}
                    className="w-full text-lg border-b border-gray-200 focus:border-gray-900 focus:ring-0 px-0 py-2 bg-transparent outline-none transition-colors"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </>
            )}

            <button 
              onClick={handleAnalyze}
              disabled={!(parseFloat(amount) > 0) || (merchantType === 'P2M' && !merchant.trim() && category === 'auto')}
              className="mt-6 w-full rounded-full bg-rc-ink py-3 font-medium text-rc-cream transition-colors hover:bg-rc-moss disabled:opacity-50"
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
                {result.source === 'DEMO' ? 'Demo · ' : ''}{CONFIDENCE_LABEL[result.confidence] ?? result.confidence}
              </span>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Recommended</p>
              <p className="text-xl font-medium text-gray-900">{getInstrumentName(result.recommendedMethodId)}</p>
              
              {result.estimatedRewardValue && result.estimatedRewardValue > 0 ? (
                <p className="text-sm font-medium text-emerald-600 mt-2">
                  Estimated reward: ₹{result.estimatedRewardValue.toFixed(result.estimatedRewardValue < 10 ? 2 : 0)}
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
                <p className="text-sm font-medium text-gray-900">
                  {getInstrumentName(result.alternativeMethodId)}
                  {result.alternativeRewardValue !== undefined && (
                    <span className="text-gray-500 font-normal"> · ₹{result.alternativeRewardValue.toFixed(result.alternativeRewardValue < 10 ? 2 : 0)}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </PageContainer>
  );
}
