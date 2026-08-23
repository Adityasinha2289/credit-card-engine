import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { CARD_DATASET } from '../../finix/data/cardDataset';
import { useDashboardStore } from '../store/dashboardStore';
import { BankLogo } from '../../cards/components/BankLogo';
import { analytics } from '../../../lib/analytics';
import { getCardTheme } from '../../finix/config/cardThemeRegistry';

export default function AddCardModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const addUserCard = useDashboardStore((s) => s.addUserCard);

  const [searchQuery, setSearchQuery] = useState('');

  const handleCloseModal = () => {
    setSearchQuery('');
    onClose();
  };

  const availableCardsToAdd = CARD_DATASET.filter(
    (mc) => !userCards.some((uc) => uc.id === mc.id)
  );

  const filteredCardsToAdd = availableCardsToAdd.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCloseModal}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      {/* Panel */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-surface-primary  rounded-[2rem] p-6 shadow-[0_0_20px_rgba(4,59,39,0.3)] border border-border-subtle  overflow-hidden flex flex-col max-h-[90vh]"
      >
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-text-primary">Add Card to Wallet</h3>
            <button
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-secondary dark:hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search cards by bank or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full input-premium pl-10 py-2 text-sm"
            />
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {filteredCardsToAdd.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No cards found matching search</p>
            ) : (
              filteredCardsToAdd.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    const randomPan = c.first4Digits + ' **** **** ' + Math.floor(1000 + Math.random() * 9000).toString();
                    const limitNum = c.minIncome ? Math.floor(c.minIncome * 0.5) : 150000;
                    
                    addUserCard({
                      id: c.id,
                      pan: randomPan,
                      cardholderName: profile?.name || 'Premium Member',
                      expiry: '12/28',
                      network: c.network.toLowerCase() as any,
                      bank: c.bank,
                      status: 'active',
                      availableCredit: limitNum * 100,
                      creditLimit: limitNum * 100,
                      label: c.name,
                      gradientFrom: getCardTheme(c.id).gradientFrom,
                      gradientTo: getCardTheme(c.id).gradientTo,
                    });
                    
                    analytics.track('Card Added', {
                      bank: c.bank,
                      network: c.network,
                      cardName: c.name
                    });
                    
                    toast.success(`${c.name} added to wallet!`);
                    handleCloseModal();
                  }}
                  className="w-full p-3 rounded-2xl flex items-center gap-3 border border-border-subtle dark:border-white/[0.03] hover:bg-surface-secondary dark:hover:bg-gray-50 text-left transition-all"
                >
                  <BankLogo bank={c.bank} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{c.name}</p>
                    <p className="text-xs text-text-muted">{c.bank} · {c.network}</p>
                  </div>
                  <span className="text-xs font-bold text-brand-emerald bg-brand-50 dark:bg-brand-emerald-muted px-2.5 py-1 rounded-full">
                    Add
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      </motion.div>
    </div>
  );
}
