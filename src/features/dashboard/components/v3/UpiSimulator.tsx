import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { DecisionCard } from '../../../../components/shared/DecisionCard';
import { evaluatePayment } from '../../../financial-engine/rewardsApi';

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

    return evaluatePayment(merchant, amount, activeCardIds, context);
  }, [merchant, amountStr, userCards]);

  return (
    <section className="space-y-5 rounded-[28px] bg-rc-pistachio p-6 text-rc-ink md:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rc-ink text-rc-pistachio">
          <Smartphone size={18} />
        </div>
        <div>
          <h3 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.01em]">About to pay?</h3>
          <p className="mt-0.5 text-[14px] text-rc-ink/70">Type the shop and amount; we'll pick the card.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="mb-1.5 block text-[12px] font-medium text-rc-ink/70">Where</label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Uber, Amazon"
              className="h-12 w-full rounded-full bg-white px-5 text-[15px] text-rc-ink outline-none ring-1 ring-rc-ink/10 transition focus:ring-2 focus:ring-rc-forest"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>
          <div className="w-full md:w-32">
            <label className="mb-1.5 block text-[12px] font-medium text-rc-ink/70">Amount, ₹</label>
            <input
              type="number"
              placeholder="850"
              className="h-12 w-full rounded-full bg-white px-5 text-[15px] tabular-nums text-rc-ink outline-none ring-1 ring-rc-ink/10 transition focus:ring-2 focus:ring-rc-forest"
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
                  title="Use this card"
                  bestFit={result.best.card.name}
                  why={result.delta > 0 && result.secondBest ? `₹${result.delta.toFixed(0)} more than your next best card. ${result.best.limitations.length > 0 ? result.best.limitations[0] : ''}` : result.best.reason}
                  expectedValue={`${result.best.confidence !== 'EXACT' ? '~' : ''}₹${result.best.cappedRewardValue.toFixed(2)}`}
                  tradeoff={result.secondBest ? `Next best: ${result.secondBest.card.name} (${result.secondBest.confidence !== 'EXACT' ? '~' : ''}₹${result.secondBest.cappedRewardValue.toFixed(2)})` : undefined}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-[20px] bg-white/70 p-4 text-center text-[14px] text-rc-muted">
                We couldn't tell which card is best for this one. Try the shop's name, like "Swiggy" or "Amazon".
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
