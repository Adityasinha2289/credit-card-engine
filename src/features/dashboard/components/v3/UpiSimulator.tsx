import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { DecisionCard } from '../../../../components/shared/DecisionCard';
import { evaluateTransaction } from '../../../finix/lib/evaluateTransaction';

export function UpiSimulator() {
  const [merchant, setMerchant] = useState('');
  const [amountStr, setAmountStr] = useState('');
  
  const userCards = useDashboardStore(s => s.userCards);

  // Live Calculation
  const result = useMemo(() => {
    const amount = parseFloat(amountStr);
    if (!merchant || isNaN(amount) || amount <= 0 || userCards.length === 0) {
      return null;
    }
    // Evaluate all active user cards
    const activeCardIds = userCards.filter(c => c.status === 'active').map(c => c.id);
    
    // Provide transaction context to the evaluator
    const transactions = useDashboardStore.getState().transactions;
    const context = { previousTransactions: transactions };

    return evaluateTransaction(merchant, amount, activeCardIds, context);
  }, [merchant, amountStr, userCards]);

  return (
    <section className="bg-white border border-gray-300 rounded-[24px] p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand-emerald text-gray-900 flex items-center justify-center font-bold shrink-0 shadow-[0_0_15px_rgba(4,59,39,0.3)]">
          <Smartphone size={20} />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-tight">UPI Simulator</h3>
          <p className="text-sm text-text-secondary mt-0.5">Live card optimization</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">Merchant</label>
            <input 
              type="text" 
              placeholder="e.g. Swiggy, Uber, Amazon" 
              className="w-full bg-surface-secondary border border-border-subtle rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">Amount (₹)</label>
            <input 
              type="number" 
              placeholder="850" 
              className="w-full bg-surface-secondary border border-border-subtle rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {result.best ? (
              <div className="mt-4">
                <DecisionCard 
                  title="Best Card For This"
                  bestFit={result.best.card.name}
                  why={result.delta > 0 && result.secondBest ? `Using this card earns you +₹${result.delta.toFixed(2)} more than your next best option. ${result.best.limitations.length > 0 ? result.best.limitations[0] : ''}` : result.best.reason}
                  expectedValue={`${result.best.confidence !== 'EXACT' ? '~' : ''}₹${result.best.cappedRewardValue.toFixed(2)}`}
                  tradeoff={result.secondBest ? `Next best: ${result.secondBest.card.name} (${result.secondBest.confidence !== 'EXACT' ? '~' : ''}₹${result.secondBest.cappedRewardValue.toFixed(2)})` : undefined}
                  actionText="Swipe Now"
                />
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500 text-center">
                Unable to confidently determine the best card for this transaction.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
