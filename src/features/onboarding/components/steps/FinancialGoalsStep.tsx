import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PRIMARY_GOALS } from '../../../../config/goals';

interface FinancialGoalsStepProps {
  onBack: () => void;
  onContinue: (goal: string) => void;
  initialValue?: string;
}

export function FinancialGoalsStep({ onBack, onContinue, initialValue }: FinancialGoalsStepProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | undefined>(initialValue);

  return (
    <div className="flex flex-col w-full">
      <SectionHeading className="mb-3">
        What matters most to you?
      </SectionHeading>
      <SectionDescription className="mb-6 md:mb-12">
        This shapes what RenoCred prioritizes for you.
      </SectionDescription>

      <div 
        className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-14 max-h-[60vh] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}
        role="radiogroup"
        aria-label="Financial Goals"
      >
        {PRIMARY_GOALS.map((goal, idx) => {
          const isSelected = selectedGoal === goal.id;
          const Icon = goal.icon;

          return (
            <motion.button
              key={goal.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedGoal(goal.id)}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: (selectedGoal && !isSelected) ? 0.6 : 1,
                y: isSelected ? -4 : 0,
                scale: isSelected ? 1.03 : ((selectedGoal && !isSelected) ? 0.98 : 1),
                filter: (selectedGoal && !isSelected) ? 'grayscale(50%)' : 'grayscale(0%)'
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, delay: idx * 0.03 }}
              className="relative px-4 py-3 md:p-6 rounded-[16px] md:rounded-[24px] text-left transition-all duration-300 flex items-center md:items-start gap-4 md:gap-5 group w-full"
              style={{
                backgroundColor: isSelected ? '#111827' : '#FFFFFF',
                border: `1px solid ${isSelected ? 'transparent' : '#E5E7EB'}`,
                boxShadow: isSelected ? '0 12px 30px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full md:rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300"
                style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
                }}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2}
                  style={{ color: isSelected ? '#FFFFFF' : '#6B7280' }}
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                <h4 className="text-[15px] md:text-[16px] font-bold tracking-tight transition-colors duration-300"
                  style={{ color: isSelected ? '#FFFFFF' : '#111827' }}
                >
                  {goal.title}
                </h4>
                <p className="text-xs mt-1 leading-relaxed hidden sm:block" style={{ color: isSelected ? '#9CA3AF' : '#6B7280' }}>
                  {goal.description}
                </p>
              </div>

              {/* Checkmark */}
              <motion.div
                className="flex w-6 h-6 rounded-full items-center justify-center shrink-0 ml-auto border-2"
                initial={false}
                animate={{
                  opacity: isSelected ? 1 : 0,
                  scale: isSelected ? 1 : 0.5,
                  borderColor: isSelected ? '#2A9D5C' : 'transparent',
                  backgroundColor: isSelected ? '#2A9D5C' : 'transparent',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Check size={14} strokeWidth={4} color="#FFFFFF" />
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4"
      >
        <BackButton onClick={onBack}>Back</BackButton>
        <ContinueButton
          onClick={() => selectedGoal && onContinue(selectedGoal)}
          disabled={!selectedGoal}
        >
          Continue
        </ContinueButton>
      </motion.div>
    </div>
  );
}
