import React, { useState, useMemo } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton, SkipButton } from '../primitives/Buttons';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X } from 'lucide-react';
import { MASTER_CARD_DATASET } from '../../../finix/data/masterDataset';
import { CreditCard as PhysicalCard } from '../../../cards/components/CreditCard';
import { cn } from '../../../../lib/utils';

interface CurrentCardsStepProps {
  onBack: () => void;
  onContinue: (cards: string[]) => void;
  initialValues?: string[];
}

export function CurrentCardsStep({ onBack, onContinue, initialValues = [] }: CurrentCardsStepProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>(initialValues);
  const [search, setSearch] = useState('');

  const filteredCards = useMemo(() => {
    if (search) {
      return MASTER_CARD_DATASET.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.bank.toLowerCase().includes(search.toLowerCase())
      );
    }
    return MASTER_CARD_DATASET.slice(0, 12);
  }, [search]);

  const selectedCardObjects = useMemo(() => {
    return selectedCards.map(id => MASTER_CARD_DATASET.find(c => c.id === id)).filter(Boolean) as typeof MASTER_CARD_DATASET;
  }, [selectedCards]);

  const toggleCard = (id: string) => {
    setSelectedCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getFakeLast4 = (id: string) => ((id.length * 17) % 9000 + 1000).toString();
  const getNetworkKey = (network?: string) => (network?.toLowerCase() === 'rupay' ? 'rupay' : network?.toLowerCase() || 'visa') as any;

  return (
    <div className="flex flex-col w-full min-h-[70vh]">
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <SectionHeading className="mb-2 font-display uppercase tracking-tight">
          Show us your wallet.
        </SectionHeading>
        <SectionDescription>
          Add the cards you already use.
        </SectionDescription>
      </div>

      {/* WALLET STACK VISUALIZATION */}
      <div className="relative w-full h-[180px] md:h-[220px] mb-8 bg-[#F9FAFB] rounded-3xl border-2 border-dashed border-[#E5E7EB] flex items-center justify-center overflow-hidden">
        {selectedCardObjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-[#9CA3AF]">
            <div className="w-16 h-10 border-2 border-current rounded-lg opacity-50 mb-3" />
            <p className="text-sm font-semibold tracking-wide uppercase">Your Wallet is Empty</p>
          </div>
        ) : (
          <div className="relative w-[280px] h-[160px] flex justify-center items-center">
            <AnimatePresence>
              {selectedCardObjects.map((card, idx) => {
                // Fan out logic
                const total = selectedCardObjects.length;
                const offset = idx - (total - 1) / 2;
                const maxSpread = Math.min(total * 15, 60); // px horizontal spread
                const spreadStep = maxSpread / Math.max(total - 1, 1);
                
                return (
                  <motion.div
                    key={card.id}
                    layoutId={`card-${card.id}`}
                    initial={{ opacity: 0, scale: 0.8, y: 100 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      x: offset * spreadStep,
                      y: Math.abs(offset) * 4,
                      rotate: offset * 3,
                      zIndex: idx
                    }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="absolute w-[240px] md:w-[260px] drop-shadow-2xl cursor-pointer hover:-translate-y-4 transition-transform duration-300"
                    onClick={() => toggleCard(card.id)}
                  >
                    <PhysicalCard
                      card={{
                        id: card.id,
                        pan: `•••• •••• •••• ${getFakeLast4(card.id)}`,
                        cardholderName: 'RENOCRED MEMBER',
                        expiry: '12/28',
                        network: getNetworkKey(card.network),
                        bank: card.bank,
                        status: 'active',
                        availableCredit: 0,
                        creditLimit: 0,
                        label: card.name,
                      }}
                      variant="compact"
                    />
                    
                    {/* Remove button overlay on hover */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity z-10 shadow-lg">
                      <X size={16} strokeWidth={3} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        
        {/* Count Pill */}
        <AnimatePresence>
          {selectedCardObjects.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 bg-[#111827] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase z-50 shadow-lg"
            >
              {selectedCardObjects.length} {selectedCardObjects.length === 1 ? 'Card' : 'Cards'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SEARCH GRID */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="relative mb-4 md:mb-6 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} style={{ color: '#6B7280' }} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for your credit cards..."
            className="w-full rounded-[16px] py-4 pl-11 pr-4 text-sm font-medium outline-none transition-all duration-200"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #F3F4F6',
              color: '#111827',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#2A9D5C'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#F3F4F6'; }}
          />
        </div>

        <div 
          className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pb-10 pr-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}
        >
          {filteredCards.map((card, idx) => {
            const isSelected = selectedCards.includes(card.id);
            
            return (
              <motion.button
                key={`grid-${card.id}`}
                layoutId={isSelected ? undefined : `card-${card.id}`}
                onClick={() => toggleCard(card.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                className={cn(
                  "relative flex flex-col items-center p-3 md:p-4 rounded-[20px] transition-all border-2 text-center h-full",
                  isSelected ? "border-[#2A9D5C] bg-[#F9FAFB] opacity-50" : "border-[#F3F4F6] bg-white hover:border-[#E5E7EB]"
                )}
              >
                <div className="w-[120px] md:w-[140px] mb-3 transition-transform duration-300" style={{ transform: isSelected ? 'scale(0.95)' : 'scale(1)' }}>
                  <PhysicalCard
                    card={{
                      id: card.id,
                      pan: `•••• •••• •••• ${getFakeLast4(card.id)}`,
                      cardholderName: 'RENOCRED MEMBER',
                      expiry: '12/28',
                      network: getNetworkKey(card.network),
                      bank: card.bank,
                      status: 'active',
                      availableCredit: 0,
                      creditLimit: 0,
                      label: card.name,
                    }}
                    variant="compact"
                  />
                </div>
                
                <span className="text-[13px] md:text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                  {card.name}
                </span>
                <span className="text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {card.bank}
                </span>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2A9D5C] flex items-center justify-center text-white shadow-md"
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 md:gap-4 mt-auto pt-4"
      >
        <BackButton onClick={onBack}>Back</BackButton>
        {selectedCards.length === 0 ? (
          <SkipButton onClick={() => onContinue([])} className="flex-1">
            Skip this step
          </SkipButton>
        ) : (
          <ContinueButton onClick={() => onContinue(selectedCards)} className="flex-1">
            Continue
          </ContinueButton>
        )}
      </motion.div>
    </div>
  );
}
