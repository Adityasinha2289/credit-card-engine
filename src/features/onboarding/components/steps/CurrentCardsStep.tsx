import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton, SkipButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
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

  // Only show first 12 cards if no search, otherwise show matched cards
  const filteredCards = search 
    ? MASTER_CARD_DATASET.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.bank.toLowerCase().includes(search.toLowerCase()))
    : MASTER_CARD_DATASET.slice(0, 12);

  const toggleCard = (id: string) => {
    setSelectedCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col w-full">
      <SectionHeading className="mb-3">
        Already have credit cards?
      </SectionHeading>
      <SectionDescription className="mb-2 md:mb-3">
        We'll optimize them. Don't have any? We'll recommend the best ones.
      </SectionDescription>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="hidden md:block text-sm mb-4 md:mb-8"
        style={{ color: '#6B7280' }}
      >
        Search and select the credit cards you currently hold.
      </motion.p>

      {/* Search */}
      <div className="relative mb-4 md:mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} style={{ color: '#6B7280' }} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for your credit cards..."
          className="w-full rounded-[12px] md:rounded-[16px] py-3 md:py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition-all duration-200"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            color: '#111827',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#2A9D5C'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
        />
      </div>

      {/* Card Carousel (Apple Wallet Style) */}
      <div 
        className="w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-10 pt-4 gap-4 px-[10%]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredCards.map((card, idx) => {
          const isSelected = selectedCards.includes(card.id);
          const fakeLast4 = ((card.id.length * 17) % 9000 + 1000).toString();
          const networkKey = (card.network?.toLowerCase() === 'rupay' ? 'rupay' : card.network?.toLowerCase() || 'visa') as any;

          return (
            <motion.div
              key={card.id}
              className="snap-center shrink-0 w-[80%] max-w-[280px] relative flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
            >
              <motion.button
                onClick={() => toggleCard(card.id)}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.95, y: 0 }}
                animate={{ 
                  y: isSelected ? -20 : 0,
                  scale: isSelected ? 1.05 : 1,
                  filter: isSelected ? 'brightness(1.1)' : 'brightness(0.95)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full relative rounded-3xl"
              >
                {/* Checkmark indicator */}
                <motion.div
                  className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 border-white"
                  initial={false}
                  animate={{
                    opacity: isSelected ? 1 : 0,
                    scale: isSelected ? 1 : 0.5,
                    backgroundColor: isSelected ? '#2A9D5C' : 'transparent',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Check size={16} strokeWidth={4} color="#FFFFFF" />
                </motion.div>

                {/* Physical Card Simulation */}
                <div className={cn(
                  "w-full transition-all duration-300 rounded-[24px]",
                  isSelected ? "shadow-[0_20px_40px_rgba(42,157,92,0.3)]" : "shadow-xl"
                )}>
                  <PhysicalCard
                    card={{
                      id: card.id,
                      pan: `${card.first4Digits || '4532'} •••• •••• ${fakeLast4}`,
                      cardholderName: 'RENOCRED MEMBER',
                      expiry: '12/28',
                      network: networkKey,
                      bank: card.bank,
                      status: 'active',
                      availableCredit: 0,
                      creditLimit: 0,
                      label: card.name,
                    }}
                    variant="compact"
                  />
                </div>
              </motion.button>
              
              <div className="mt-8 flex flex-col items-center">
                <span className="text-sm font-bold text-gray-900 text-center">{card.name}</span>
                <span className="text-xs font-medium text-gray-500 mt-1">{card.bank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 md:gap-4"
      >
        <BackButton onClick={onBack}>Back</BackButton>
        {selectedCards.length === 0 ? (
          <SkipButton onClick={() => onContinue([])} className="flex-1">
            Skip this step
          </SkipButton>
        ) : (
          <ContinueButton onClick={() => onContinue(selectedCards)} className="flex-1">
            Finish Setup
          </ContinueButton>
        )}
      </motion.div>
    </div>
  );
}
