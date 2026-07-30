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
      <SectionHeading className="mb-3">
        Which stage are you in?
      </SectionHeading>
      <SectionDescription className="mb-12">
        This helps TAQDEER recommend the right cards for you.
      </SectionDescription>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
        {STAGES.map((stage, idx) => {
          const isSelected = selectedStage === stage.id;

          return (
            <motion.button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-7 rounded-[20px] text-left transition-all duration-400 overflow-hidden group flex flex-col min-h-[240px]"
              style={{
                backgroundColor: isSelected ? '#121414' : '#0C0D0D',
                border: `1px solid ${isSelected ? '#5D8F74' : '#232626'}`,
                boxShadow: isSelected ? '0 8px 30px rgba(93,143,116,0.14)' : 'none',
              }}
            >
              {/* Left accent bar */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ backgroundColor: '#5D8F74', transformOrigin: 'top' }}
                initial={false}
                animate={{ scaleY: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />

              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight mb-2 transition-colors duration-300"
                    style={{ color: isSelected ? '#F4F4F2' : '#A4A8A6' }}
                  >
                    {stage.title}
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
                    style={{
                      backgroundColor: isSelected ? 'rgba(93,143,116,0.15)' : '#1a1c1c',
                      color: isSelected ? '#5D8F74' : '#6E7471',
                    }}
                  >
                    {stage.age}
                  </span>
                </div>

                {/* Checkmark */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isSelected ? 1 : 0, scale: isSelected ? 1 : 0.5 }}
                  transition={{ duration: 0.25 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#5D8F74' }}
                >
                  <Check size={14} strokeWidth={3} color="#F4F4F2" />
                </motion.div>
              </div>

              <div className="mt-auto">
                <p className="text-[15px] mb-3 leading-snug transition-colors duration-300"
                  style={{ color: isSelected ? '#F4F4F2' : '#6E7471' }}
                >
                  {stage.description}
                </p>
                {stage.caption && (
                  <p className="text-sm leading-relaxed" style={{ color: '#6E7471' }}>
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
