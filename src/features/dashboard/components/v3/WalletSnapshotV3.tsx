import { motion } from 'framer-motion';
import { Wallet as WalletIcon, CreditCard, PieChart, Calendar, Gift } from 'lucide-react';
import { CreditCard as PhysicalCard } from '../../../cards/components/CreditCard';
import type { FinixCard } from '../../../../features/finix/data/cardDataset';
import type { CreditAccountData } from '../../types/dashboard.types';
import { formatCents } from '../../../../lib/utils';
import { EmptyWalletGuidance } from './EmptyWalletGuidance';
import { getCardTheme } from '../../../finix/config/cardThemeRegistry';

interface WalletSnapshotV3Props {
  userCards: FinixCard[];
  creditAccounts: CreditAccountData[];
  activeCardId: string | null;
  setActiveCardId: (id: string) => void;
  onAddCard: () => void;
}

export function WalletSnapshotV3({ 
  userCards, 
  creditAccounts, 
  activeCardId, 
  setActiveCardId,
  onAddCard
}: WalletSnapshotV3Props) {
  
  if (userCards.length === 0) {
    return <EmptyWalletGuidance onAddCard={onAddCard} />;
  }

  // Calculate Wallet Metrics
  let totalLimit = 0;
  let totalBalance = 0;
  
  userCards.forEach(card => {
    const acc = creditAccounts.find(a => a.cardId === card.id);
    if (acc) {
      totalLimit += acc.totalLimit;
      totalBalance += acc.currentBalance;
    } else {
      totalLimit += card.creditLimit;
    }
  });

  const utilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  const nextPaymentDate = creditAccounts.length > 0 ? creditAccounts[0].dueDate : 'No upcoming bills';

  const primaryCard = userCards.find(c => c.id === activeCardId) || userCards[0];
  const primaryAccount = creditAccounts.find(a => a.cardId === primaryCard.id);
  
  const cardWithLiveCredit = {
    ...primaryCard,
    creditLimit: primaryAccount ? primaryAccount.totalLimit : primaryCard.creditLimit,
    availableCredit: primaryAccount
      ? Math.max(0, primaryAccount.totalLimit - primaryAccount.currentBalance)
      : primaryCard.availableCredit,
  };

  return (
    <div className="panel-glass rounded-[2rem] p-6 border border-border-subtle  shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
          <WalletIcon size={20} className="text-brand-emerald" />
          Wallet Snapshot
        </h3>
        <span className="text-[10px] font-bold tracking-wider uppercase bg-surface-secondary dark:bg-gray-50 px-2.5 py-1 rounded-full text-text-secondary">
          {userCards.length} Cards
        </span>
      </div>

      <div className="relative h-[220px] mb-8 cursor-pointer group" onClick={onAddCard}>
        {/* Stacked Cards Visual */}
        {userCards.slice(0, 3).map((card, i) => {
          const isPrimary = i === 0;
          return (
            <motion.div
              key={card.id}
              className="absolute inset-x-0 mx-auto transition-all duration-300 group-hover:-translate-y-2"
              style={{
                top: i * 20,
                scale: 1 - i * 0.05,
                zIndex: 10 - i,
                opacity: 1 - i * 0.15,
              }}
            >
              {isPrimary ? (
                <PhysicalCard card={cardWithLiveCredit} revealed={false} variant="featured" />
              ) : (
                <div 
                  className="w-full h-[190px] rounded-2xl opacity-50 border border-border-subtle"
                  style={{ background: `linear-gradient(135deg, ${getCardTheme(card.id).gradientFrom}, ${getCardTheme(card.id).gradientTo})` }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-4 rounded-2xl bg-surface-primary dark:bg-gray-50 border border-border-subtle">
          <div className="flex items-center gap-2 mb-1">
            <PieChart size={14} className="text-text-muted" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Utilization</span>
          </div>
          <p className="text-lg font-bold text-text-primary">{utilization}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-primary dark:bg-gray-50 border border-border-subtle">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-text-muted" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Next Bill</span>
          </div>
          <p className="text-sm font-bold text-text-primary mt-1 truncate">
            {nextPaymentDate !== 'No upcoming bills' ? new Date(nextPaymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : nextPaymentDate}
          </p>
        </div>
      </div>
    </div>
  );
}
