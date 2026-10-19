/**
 * One card in your wallet: set its credit limit, see what it's best at, remove it.
 * A centred dialog on wide screens, a bottom sheet on phones.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { CardData } from '../../cards/types/card.types';
import { useDashboardStore } from '../store/dashboardStore';
import { CardFace, displayCardName } from '../../../public-platform/site/CardFace';
import { SPEND_CATEGORIES, cardsByIds } from '../../../public-platform/site/swipeMath';

interface Props {
  card: CardData;
  onClose: () => void;
  onRemove: () => Promise<void>;
}

export function CardDetailsModal({ card, onClose, onRemove }: Props) {
  const setCardLimit = useDashboardStore((s) => s.setCardLimit);
  const [limit, setLimit] = useState(card.creditLimit > 0 ? String(Math.round(card.creditLimit / 100)) : '');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const [catalogCard] = cardsByIds([card.id]);
  const rates = [...(catalogCard?.rewards ?? [])].sort((a, b) => b.rate - a.rate).slice(0, 4);
  const label = (id: string) => SPEND_CATEGORIES.find((c) => c.id === id)?.label ?? id;
  const limitRupees = Number(limit.replace(/[^\d]/g, ''));
  const changed = limitRupees > 0 && limitRupees * 100 !== card.creditLimit;

  const saveLimit = async () => {
    if (!changed) return;
    setSaving(true);
    try {
      await setCardLimit(card.id, limitRupees * 100);
      toast.success('Limit saved');
    } catch {
      toast.error("Couldn't save the limit");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await onRemove();
      toast.success('Card removed');
      onClose();
    } catch {
      toast.error("Couldn't remove the card");
      setRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-rc-night/70 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={displayCardName(card.label || 'Card')}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[32px] bg-rc-cream p-6 pb-8 text-rc-ink sm:rounded-[32px]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-rc-muted">{card.bank}</p>
            <h2 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em]">{displayCardName(card.label || 'Card')}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rc-ink/[0.06] hover:bg-rc-ink/[0.1]">
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <CardFace name={card.label || 'Card'} bank={card.bank || ''} network={card.network} width={280} />
        </div>

        {/* limit: needed for utilisation and available credit */}
        <form onSubmit={(e) => { e.preventDefault(); void saveLimit(); }} className="mt-6">
          <label htmlFor="card-limit" className="text-[14px] font-medium">Credit limit</label>
          <p className="text-[13px] text-rc-muted">It's on your statement or in your bank's app. Used for utilisation, never shared.</p>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <span aria-hidden className="absolute left-5 top-1/2 -translate-y-1/2 text-rc-ink/50">₹</span>
              <input
                id="card-limit"
                inputMode="numeric"
                value={limit ? Number(limit.replace(/[^\d]/g, '') || 0).toLocaleString('en-IN') : ''}
                onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="e.g. 2,00,000"
                className="h-12 w-full rounded-full bg-white pl-9 pr-4 text-[15px] tabular-nums outline-none ring-1 ring-rc-ink/10 focus:ring-2 focus:ring-rc-forest"
              />
            </div>
            <button type="submit" disabled={!changed || saving} className="h-12 rounded-full bg-rc-ink px-6 text-[14px] font-medium text-rc-cream transition-colors hover:bg-rc-moss disabled:opacity-40">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>

        {rates.length > 0 && (
          <div className="mt-6">
            <p className="text-[14px] font-medium">Where it earns most</p>
            <ul className="mt-2 divide-y divide-rc-ink/[0.07] rounded-[20px] bg-white/70 px-4">
              {rates.map((r) => (
                <li key={r.category} className="flex items-center justify-between py-2.5 text-[14px]">
                  <span>{label(r.category)}</span>
                  <span className="font-semibold tabular-nums text-rc-forest">{r.rate}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 border-t border-rc-ink/10 pt-5">
          {confirmRemove ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px]">Remove this card from your wallet?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmRemove(false)} className="h-10 rounded-full px-4 text-[14px] text-rc-muted hover:text-rc-ink">Keep</button>
                <button type="button" onClick={() => void remove()} disabled={removing} className="h-10 rounded-full bg-[#C2410C] px-5 text-[14px] font-medium text-white disabled:opacity-50">
                  {removing ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmRemove(true)} className="inline-flex items-center gap-2 text-[14px] font-medium text-[#C2410C] hover:underline">
              <Trash2 size={15} /> Remove from wallet
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
