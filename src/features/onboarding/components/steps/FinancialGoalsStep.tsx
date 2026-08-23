import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';
import { Check, Trophy, PiggyBank, Plane, Crown, TrendingUp, Banknote, DoorOpen, ShoppingBag } from 'lucide-react';

const GOALS = [
  { id: 'Maximum Rewards', title: 'Maximize Rewards', description: 'Earn the most points on every rupee.', icon: Trophy },
  { id: 'Save More Money', title: 'Save More Money', description: 'Reduce fees and optimize spending.', icon: PiggyBank },
  { id: 'Travel Benefits', title: 'Travel Better', description: 'Lounge access, miles, hotel perks.', icon: Plane },
  { id: 'Premium Lifestyle', title: 'Premium Lifestyle', description: 'Exclusive access and luxury perks.', icon: Crown },
  { id: 'Build Credit Score', title: 'Build Credit', description: 'Improve your CIBIL and unlock limits.', icon: TrendingUp },
  { id: 'Maximise Cashback', title: 'Cashback First', description: 'Direct cash returns on purchases.', icon: Banknote },
  { id: 'Airport Lounges', title: 'Airport Lounge Access', description: 'Priority pass and domestic lounges.', icon: DoorOpen },
  { id: 'Earn Reward Points', title: 'Luxury Shopping', description: 'Premium brands and exclusive offers.', icon: ShoppingBag },
];

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
        How should TAQDEER think?
      </SectionHeading>
      <SectionDescription className="mb-6 md:mb-12">
        This shapes every recommendation you'll receive.
      </SectionDescription>

      <div className="flex flex-wrap md:grid md:grid-cols-2 gap-2 md:gap-4 mb-8 md:mb-14 max-h-[55vh] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}
      >
        {GOALS.map((goal, idx) => {
          const isSelected = selectedGoal === goal.id;
          const Icon = goal.icon;

          return (
            <motion.button
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="relative px-3 py-2 md:p-5 rounded-[12px] md:rounded-[20px] text-left transition-all duration-300 flex items-center md:items-start gap-2 md:gap-4 group w-fit md:w-auto"
              style={{
                backgroundColor: isSelected ? '#F9FAFB' : '#FFFFFF',
                border: `1px solid ${isSelected ? '#2A9D5C' : '#E5E7EB'}`,
                boxShadow: isSelected ? '0 4px 20px rgba(42,157,92,0.12)' : 'none',
              }}
            >
              {/* Left accent */}
              <motion.div
                className="hidden md:block absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ backgroundColor: '#2A9D5C' }}
                initial={false}
                animate={{ scaleY: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <div className="w-6 h-6 md:w-10 md:h-10 rounded-full md:rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                style={{
                  backgroundColor: isSelected ? 'rgba(42,157,92,0.15)' : '#F3F4F6',
                }}
              >
                <Icon className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" strokeWidth={1.5}
                  style={{ color: isSelected ? '#2A9D5C' : '#6B7280' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] md:text-[15px] font-semibold tracking-tight transition-colors duration-300"
                  style={{ color: isSelected ? '#111827' : '#4B5563' }}
                >
                  {goal.title}
                </h4>
                <p className="hidden md:block text-xs mt-1 leading-relaxed" style={{ color: '#6B7280' }}>
                  {goal.description}
                </p>
              </div>

              {/* Checkmark */}
              <motion.div
                className="hidden md:flex w-6 h-6 rounded-full items-center justify-center shrink-0"
                initial={false}
                animate={{
                  opacity: isSelected ? 1 : 0,
                  scale: isSelected ? 1 : 0.3,
                  backgroundColor: isSelected ? '#2A9D5C' : 'transparent',
                }}
                transition={{ duration: 0.2 }}
              >
                <Check size={12} strokeWidth={3} color="#FFFFFF" />
              </motion.div>
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
          onClick={() => selectedGoal && onContinue(selectedGoal)}
          disabled={!selectedGoal}
        >
          Continue
        </ContinueButton>
      </motion.div>
    </div>
  );
}
