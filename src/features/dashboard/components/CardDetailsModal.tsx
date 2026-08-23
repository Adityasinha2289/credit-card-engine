import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CreditCard as CreditCardIcon, Activity } from 'lucide-react';
import { CardData } from '../../cards/types/card.types';
import { CreditCard as PhysicalCard } from '../../cards/components/CreditCard';
import { cn } from '../../../lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  card: CardData;
  onClose: () => void;
  onRemove: () => Promise<void>;
}

export function CardDetailsModal({ card, onClose, onRemove }: Props) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove();
      toast.success('Card removed from wallet');
      onClose();
    } catch (error) {
      toast.error('Failed to remove card');
      setIsRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#070A08]/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="relative w-full max-w-md bg-white border border-gray-300 rounded-[24px] shadow-2xl overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display text-gray-900 flex items-center gap-2">
              <CreditCardIcon size={20} className="text-[#2A9D5C]" />
              Card Details
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex justify-center">
            <PhysicalCard card={card} variant="wallet" />
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-300 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Card Name</span>
                <span className="text-sm font-medium text-gray-900">{(card as any).name || `${card.bank} ${card.network}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Card Number</span>
                <span className="text-sm font-mono text-gray-900">•••• {card.pan.slice(-4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <div className="flex items-center gap-1.5">
                  <Activity size={14} className={card.status === 'active' ? "text-[#2A9D5C]" : "text-amber-500"} />
                  <span className={cn("text-sm font-medium capitalize", card.status === 'active' ? "text-[#2A9D5C]" : "text-amber-500")}>
                    {card.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credit Limit</span>
                <span className="text-sm font-mono text-gray-900">₹{(card.creditLimit / 100).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-500 font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            {isRemoving ? 'Removing...' : 'Remove from Wallet'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
