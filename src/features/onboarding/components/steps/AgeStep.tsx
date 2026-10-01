import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const STAGES = [
  {
    id: 'youth',
    title: 'Youth',
    age: '18–22',
    description: 'Building your financial journey.',
    caption: 'Discover beginner-friendly cards, student offers, travel, education, lifestyle rewards.',
  },
  {
    id: 'professional',
    title: 'Professional',
    age: '23+',
    description: 'Maximize rewards, travel, luxury, family, wealth, business spending.',
    caption: undefined,
  },
];

interface AgeStepProps {
  onBack: () => void;
  onContinue: (age: string) => void;
  initialValue?: string;
}

export function AgeStep({ onBack, onContinue, initialValue }: AgeStepProps) {
  const getInitialStage = () => {
    if (initialValue === '18–22' || initialValue === 'youth') return 'youth';
    if (initialValue) return 'professional';
    return undefined;
  };

  const [selectedStage, setSelectedStage] = useState<string | undefined>(getInitialStage());

  return (
    <div className="flex flex-col w-full">
      <SectionHeading className="mb-3 font-display uppercase tracking-tight">
        How do you see your money life?
      </SectionHeading>
      <SectionDescription className="mb-6 md:mb-12">
        We'll use this to shape your experience.
      </SectionDescription>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 mb-8 md:mb-14">
        {STAGES.map((stage, idx) => {
          const isSelected = selectedStage === stage.id;

          return (
            <motion.button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: 1, 
                y: isSelected ? -4 : 0,
                scale: isSelected ? 1.02 : 1
              }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-5 md:p-7 rounded-[24px] text-left transition-all duration-400 overflow-hidden group flex flex-col min-h-[140px] md:min-h-[220px]"
              style={{
                backgroundColor: isSelected ? '#FFFFFF' : '#F9FAFB',
                border: `2px solid ${isSelected ? '#111827' : 'transparent'}`,
                boxShadow: isSelected ? '0 12px 40px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              {/* Subtle top accent bar */}
              <motion.div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: '#111827', transformOrigin: 'left' }}
                initial={false}
                animate={{ scaleX: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />

              <div className="flex justify-between items-start mb-3 md:mb-5">
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight mb-2 transition-colors duration-300"
                    style={{ color: isSelected ? '#111827' : '#4B5563' }}
                  >
                    {stage.title}
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
                    style={{
                      backgroundColor: isSelected ? 'rgba(42,157,92,0.15)' : '#F3F4F6',
                      color: isSelected ? '#2A9D5C' : '#6B7280',
                    }}
                  >
                    {stage.age}
                  </span>
                </div>

                {/* Checkmark */}
                <motion.div
                  initial={false}
                  animate={{ 
                    opacity: isSelected ? 1 : 0, 
                    scale: isSelected ? 1 : 0.5,
                    rotate: isSelected ? 0 : -45
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#111827' }}
                >
                  <Check size={14} strokeWidth={3} color="#FFFFFF" />
                </motion.div>
              </div>

              <div className="mt-auto">
                <p className="text-[15px] mb-3 leading-snug transition-colors duration-300"
                  style={{ color: isSelected ? '#111827' : '#6B7280' }}
                >
                  {stage.description}
                </p>
                {stage.caption && (
                  <p className="hidden md:block text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                    {stage.caption}
                  </p>
                )}
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
        <ContinueButton
          onClick={() => selectedStage && onContinue(selectedStage === 'youth' ? '18–22' : '23-30')}
          disabled={!selectedStage}
        >
          Continue
        </ContinueButton>
      </motion.div>
    </div>
  );
}
