import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton, SkipButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { MASTER_CARD_DATASET } from '../../../finix/data/masterDataset';
import { CreditCard as PhysicalCard } from '../../../cards/components/CreditCard';

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
      <div className="flex items-start justify-between mb-3">
        <SectionHeading className="mb-0">
          Already have credit cards?
        </SectionHeading>
        <SkipButton onClick={() => onContinue([])} className="mt-2 shrink-0">
          Skip this step
        </SkipButton>
      </div>
      <SectionDescription className="mb-3">
        We'll optimize them. Don't have any? We'll recommend the best ones.
      </SectionDescription>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-sm mb-8"
        style={{ color: '#6E7471' }}
      >
        Search and select the credit cards you currently hold.
      </motion.p>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} style={{ color: '#6E7471' }} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for your credit cards..."
          className="w-full rounded-[16px] py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition-all duration-200"
          style={{
            backgroundColor: '#0C0D0D',
            border: '1px solid #232626',
            color: '#F4F4F2',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#5D8F74'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#232626'; }}
        />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-14 max-h-[45vh] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#232626 transparent' }}
      >
        {filteredCards.map((card, idx) => {
          const isSelected = selectedCards.includes(card.id);
          const fakeLast4 = ((card.id.length * 17) % 9000 + 1000).toString();
          const networkKey = (card.network?.toLowerCase() === 'rupay' ? 'rupay' : card.network?.toLowerCase() || 'visa') as any;

          return (
            <motion.button
              key={card.id}
              onClick={() => toggleCard(card.id)}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.3) }}
              className="group relative p-3.5 rounded-[20px] flex flex-col items-center justify-between gap-3 transition-all duration-300 text-center overflow-hidden"
              style={{
                backgroundColor: isSelected ? '#121715' : '#0C0D0D',
                border: `1px solid ${isSelected ? '#5D8F74' : '#232626'}`,
                boxShadow: isSelected ? '0 8px 24px rgba(93,143,116,0.18)' : 'none',
              }}
            >
              {/* Checkmark indicator */}
              <motion.div
                className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                initial={false}
                animate={{
                  opacity: isSelected ? 1 : 0,
                  scale: isSelected ? 1 : 0.3,
                  backgroundColor: isSelected ? '#5D8F74' : 'transparent',
                }}
                transition={{ duration: 0.2 }}
              >
                <Check size={12} strokeWidth={3} color="#F4F4F2" />
              </motion.div>

              {/* Miniature 2D Physical Card */}
              <div className="w-full flex items-center justify-center pt-2 pb-1 relative">
                <div className="w-full max-w-[200px] transition-transform duration-300 group-hover:scale-105">
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
              </div>

              <div className="flex flex-col items-center w-full px-1 pb-1">
                <span className="text-xs font-semibold text-center leading-snug line-clamp-1 mb-1 transition-colors"
                  style={{ color: isSelected ? '#F4F4F2' : '#D1D5DB' }}
                >
                  {card.name}
                </span>
                <span className="text-[10px] text-center font-medium"
                  style={{ color: isSelected ? '#5D8F74' : '#6E7471' }}
                >
                  {card.bank} • {card.network}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <BackButton onClick={onBack}>Back</BackButton>
        <ContinueButton onClick={() => onContinue(selectedCards)}>
          Finish Setup
        </ContinueButton>
      </motion.div>
    </div>
  );
}
