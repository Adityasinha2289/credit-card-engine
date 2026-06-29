import { useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronRight, Minus } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { useShallow } from 'zustand/shallow';
import { useDashboardStore } from '../store/dashboardStore';
import type { AddTransactionInput, TransactionCategory } from '../types/dashboard.types';
import { TransactionRow } from './TransactionRow';
import { CATEGORY_STYLES } from '../../cards/components/CategoryIcon';

// ─────────────────────────────────────────────────────────────────────────────
//  QUICK-ADD FORM
//  A minimal inline form that slides down from the header when triggered.
// ─────────────────────────────────────────────────────────────────────────────

interface QuickAddFormProps {
  onClose:   () => void;
  activeCardId: string;
}

const CATEGORIES = Object.entries(CATEGORY_STYLES).map(([key, val]) => ({
  value: key as TransactionCategory,
  label: val.label,
}));

function QuickAddForm({ onClose, activeCardId }: QuickAddFormProps) {
  const addTransaction = useDashboardStore((s) => s.addTransaction);
  const formId = useId();

  const [merchant, setMerchant]   = useState('');
  const [amount,   setAmount]     = useState('');
  const [category, setCategory]   = useState<TransactionCategory>('other');
  const [error,    setError]      = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!merchant.trim()) { setError('Merchant name is required.'); return; }
    if (isNaN(parsed) || parsed <= 0) { setError('Enter a valid positive amount.'); return; }

    const input: AddTransactionInput = {
      merchant:  merchant.trim(),
      amount:    Math.round(parsed * 100),       // convert dollars → cents
      date:      new Date().toISOString(),
      category,
      type:      'debit',
      cardId:    activeCardId,
      pending:   false,
    };
    addTransaction(input);
    onClose();
  }

  return (
    <motion.div
      key="quick-add-form"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{    height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden"
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="glass-surface rounded-2xl shadow-ag-card p-4 mb-3 flex flex-col gap-3"
        aria-label="Quick-add transaction"
        noValidate
      >
        <div className="flex items-center gap-2">
          {/* Merchant */}
          <input
            id={`${formId}-merchant`}
            type="text"
            placeholder="Merchant name"
            value={merchant}
            onChange={(e) => { setMerchant(e.target.value); setError(null); }}
            className={cn(
              'flex-1 input-premium',
            )}
            autoFocus
            autoComplete="off"
            aria-label="Merchant name"
          />
          {/* Amount */}
          <div className="relative w-28">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-tertiary">₹</span>
            <input
              id={`${formId}-amount`}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null); }}
              className={cn(
                'w-full input-premium pl-6 font-semibold',
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              )}
              aria-label="Amount in rupees"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-150',
                category === value
                  ? 'bg-brand-500 text-white shadow-ag-glow-primary'
                  : 'bg-canvas-200 text-ink-secondary hover:bg-canvas-300',
              )}
              aria-pressed={category === value}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -4 }}
              className="text-xs text-loss font-medium"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-ink-tertiary hover:text-ink-secondary px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={cn(
              'text-xs font-semibold text-white px-4 py-1.5 rounded-full',
              'bg-brand-500 hover:bg-brand-600 shadow-ag-glow-primary',
              'transition-all duration-150 active:scale-95',
            )}
          >
            Add Transaction
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 text-center"
      aria-label="No transactions"
    >
      <div className="w-16 h-16 rounded-2xl bg-canvas-200/60 dark:bg-canvas-300/20 flex items-center justify-center mb-5 shadow-ag-base">
        <ChevronRight size={24} className="text-ink-disabled" />
      </div>
      <p className="text-sm font-display font-bold text-ink-secondary mb-1">No transactions yet</p>
      <p className="text-xs text-ink-tertiary max-w-[220px] leading-relaxed">
        Add your first transaction using the button above to start tracking.
      </p>
    </motion.li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRANSACTION FEED — Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface TransactionFeedProps {
  /** Max transactions to display. Defaults to 12. */
  limit?: number;
  /** Optional extra wrapper class */
  className?: string;
}

export function TransactionFeed({ limit = 12, className }: TransactionFeedProps) {
  // Bug fix: filter by activeCardId so only relevant transactions show
  const allTransactions = useDashboardStore(
    useShallow((s) => s.transactions),
  );
  const activeCardId = useDashboardStore((s) => s.activeCardId);
  const [showForm, setShowForm] = useState(false);

  // Filter to the active card, then cap at limit
  const transactions = allTransactions
    .filter((t) => !t.cardId || t.cardId === activeCardId)
    .slice(0, limit);

  // Track which IDs were present on previous render so we can mark new ones
  const prevIdsRef = useRef<Set<string>>(new Set(transactions.map((t) => t.id)));
  const newIdRef   = useRef<string | null>(null);

  // Detect the most recently added transaction
  const currentIds = new Set(transactions.map((t) => t.id));
  let foundNew = false;
  for (const id of currentIds) {
    if (!prevIdsRef.current.has(id)) {
      newIdRef.current = id;
      foundNew = true;
    }
  }
  // Bug fix: clear newId if not found this render (it was from a prior render)
  if (!foundNew && newIdRef.current && currentIds.has(newIdRef.current)) {
    // keep it for exactly one render, then clear via setTimeout
    const idToClear = newIdRef.current;
    setTimeout(() => {
      if (newIdRef.current === idToClear) newIdRef.current = null;
    }, 600);
  }
  prevIdsRef.current = currentIds;

  return (
    <section
      className={cn('flex flex-col gap-0', className)}
      aria-label="Recent Transactions"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-display font-bold text-ink-primary tracking-tight">
            Recent Activity
          </h2>
          <p className="text-[11px] text-ink-disabled font-medium mt-0.5">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            {' '}· active card
          </p>
        </div>

        <button
          id="add-transaction-btn"
          type="button"
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-label={showForm ? 'Close add transaction form' : 'Add transaction'}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-zinc-200/20 dark:border-white/10 shadow-ag-base text-brand-500 hover:bg-zinc-50 hover:text-brand-600 transition-all duration-200"
        >
          {showForm ? (
            <Minus size={14} strokeWidth={3} />
          ) : (
            <Plus size={14} strokeWidth={3} />
          )}
        </button>
      </div>

      {/* ── Quick-add form (animated) ───────────────────────────────── */}
      <AnimatePresence initial={false}>
        {showForm && (
          <QuickAddForm
            key="quick-add"
            onClose={() => setShowForm(false)}
            activeCardId={activeCardId}
          />
        )}
      </AnimatePresence>

      {/* ── List ───────────────────────────────────────────────────── */}
      <div className="relative mt-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 pb-6 -mr-2 scroll-shadow-bottom">
        <motion.ul
          className="flex flex-col gap-2"
          role="list"
          /*
           * layout="position" on the container ensures the ul itself doesn't
           * jump when its height changes (e.g. when form opens/closes).
           */
          layout="position"
        >
          <AnimatePresence initial={true} mode="popLayout">
            {transactions.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              transactions.map((txn, i) => (
                <TransactionRow
                  key={txn.id}
                  transaction={txn}
                  index={i}
                  isNew={txn.id === newIdRef.current}
                />
              ))
            )}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

export default TransactionFeed;
