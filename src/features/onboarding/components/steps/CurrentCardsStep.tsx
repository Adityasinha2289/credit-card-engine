import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton, SkipButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';

const TOP_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'sbi', name: 'SBI Card' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'amex', name: 'American Express' },
  { id: 'kotak', name: 'Kotak Mahindra' },
  { id: 'indusind', name: 'IndusInd Bank' },
  { id: 'yes', name: 'YES Bank' },
  { id: 'rbl', name: 'RBL Bank' },
  { id: 'sc', name: 'Standard Chartered' },
  { id: 'citi', name: 'Citibank' },
  { id: 'bob', name: 'Bank of Baroda' },
];

interface CurrentCardsStepProps {
  onBack: () => void;
  onContinue: (cards: string[]) => void;
  initialValues?: string[];
}

export function CurrentCardsStep({ onBack, onContinue, initialValues = [] }: CurrentCardsStepProps) {
  const [selectedBanks, setSelectedBanks] = useState<string[]>(initialValues);
  const [search, setSearch] = useState('');

  const filteredBanks = TOP_BANKS.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const toggleBank = (id: string) => {
    setSelectedBanks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
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
        Select all banks you hold cards with.
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
          placeholder="Search banks..."
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

      {/* Bank grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-14 max-h-[40vh] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#232626 transparent' }}
      >
        {filteredBanks.map((bank, idx) => {
          const isSelected = selectedBanks.includes(bank.id);

          return (
            <motion.button
              key={bank.id}
              onClick={() => toggleBank(bank.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.02 }}
              className="relative p-4 rounded-[16px] flex flex-col items-center justify-center gap-3 transition-all duration-300"
              style={{
                backgroundColor: isSelected ? '#121414' : '#0C0D0D',
                border: `1px solid ${isSelected ? '#5D8F74' : '#232626'}`,
                boxShadow: isSelected ? '0 4px 15px rgba(93,143,116,0.1)' : 'none',
                minHeight: 88,
              }}
            >
              {/* Checkmark */}
              <motion.div
                className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                initial={false}
                animate={{
                  opacity: isSelected ? 1 : 0,
                  scale: isSelected ? 1 : 0.3,
                  backgroundColor: isSelected ? '#5D8F74' : 'transparent',
                }}
                transition={{ duration: 0.2 }}
              >
                <Check size={10} strokeWidth={3} color="#F4F4F2" />
              </motion.div>

              {/* Bank initial as placeholder */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: isSelected ? 'rgba(93,143,116,0.15)' : '#1a1c1c',
                }}
              >
                <span className="font-display font-bold text-sm"
                  style={{ color: isSelected ? '#5D8F74' : '#6E7471' }}
                >
                  {bank.name.charAt(0)}
                </span>
              </div>

              <span className="text-xs font-medium text-center leading-tight"
                style={{ color: isSelected ? '#F4F4F2' : '#A4A8A6' }}
              >
                {bank.name}
              </span>
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
        <ContinueButton onClick={() => onContinue(selectedBanks)}>
          Finish Setup
        </ContinueButton>
      </motion.div>
    </div>
  );
}
