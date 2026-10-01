import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton } from '../primitives/Buttons';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  Plane, Utensils, ShoppingBag, Dumbbell,
  BookOpen, Tv, HeartPulse, Laptop,
  Shirt, Home, Fuel, ShoppingCart
} from 'lucide-react';

const PRIORITIES = [
  { id: 'Travel', title: 'Travel', icon: Plane },
  { id: 'Dining', title: 'Dining', icon: Utensils },
  { id: 'Fitness', title: 'Fitness', icon: Dumbbell },
  { id: 'Shopping', title: 'Shopping', icon: ShoppingBag },
  { id: 'Learning', title: 'Learning', icon: BookOpen },
  { id: 'Entertainment', title: 'Entertainment', icon: Tv },
  { id: 'Healthcare', title: 'Healthcare', icon: HeartPulse },
  { id: 'Technology', title: 'Technology', icon: Laptop },
  { id: 'Fashion', title: 'Fashion', icon: Shirt },
  { id: 'Home', title: 'Home', icon: Home },
  { id: 'Fuel', title: 'Fuel', icon: Fuel },
  { id: 'Groceries', title: 'Groceries', icon: ShoppingCart },
];

interface LifestyleStepProps {
  onBack: () => void;
  onContinue: (priorities: string[]) => void;
  initialValues?: string[];
}

export function LifestyleStep({ onBack, onContinue, initialValues = [] }: LifestyleStepProps) {
  const [selected, setSelected] = useState<string[]>(initialValues);

  const toggleSelection = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const isFull = selected.length === 5;

  return (
    <div className="flex flex-col w-full">
      <SectionHeading className="mb-3 font-display uppercase tracking-tight">
        What's your money obsession?
      </SectionHeading>
      <SectionDescription className="mb-2">
        Pick what shows up in your life.
      </SectionDescription>
      
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-semibold"
          style={{ color: '#6B7280' }}
        >
          {selected.length} / 5 SELECTED
        </motion.p>

        <AnimatePresence>
          {isFull && (
            <motion.span 
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-xs font-bold px-3 py-1 bg-[#111827] text-white rounded-full uppercase tracking-wider"
            >
              Wallet got the message.
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap md:grid md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-14 max-h-[52vh] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}
      >
        {PRIORITIES.map((item, idx) => {
          const isSelected = selected.includes(item.id);
          const Icon = item.icon;
          // Calculate subtle rotation to make it playful
          const rotationOffset = (idx % 2 === 0 ? 1.5 : -1.5);

          return (
            <motion.button
              key={item.id}
              onClick={() => toggleSelection(item.id)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.92, rotate: 0 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: 1, 
                y: isSelected ? -4 : 0,
                rotate: isSelected ? rotationOffset : 0,
                scale: isSelected ? 1.05 : 1
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 25, 
                delay: idx * 0.02 
              }}
              className="relative p-3 md:p-5 rounded-[16px] md:rounded-[20px] text-center transition-all group flex flex-col items-center justify-center gap-3 w-[calc(50%-6px)] md:w-auto h-[110px] md:h-[130px]"
              style={{
                backgroundColor: isSelected ? '#111827' : '#FFFFFF',
                border: `1px solid ${isSelected ? 'transparent' : '#E5E7EB'}`,
                boxShadow: isSelected ? '0 12px 30px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {/* Checkmark indicator for selection */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#2A9D5C] flex items-center justify-center"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Check size={12} strokeWidth={4} color="#FFFFFF" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center"
                animate={{ 
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : '#F3F4F6'
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={2}
                  style={{ color: isSelected ? '#FFFFFF' : '#6B7280' }}
                />
              </motion.div>

              <h4 className="text-[13px] md:text-[14px] font-bold tracking-tight"
                style={{ color: isSelected ? '#FFFFFF' : '#4B5563' }}
              >
                {item.title}
              </h4>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4 mt-auto"
      >
        <BackButton onClick={onBack}>Back</BackButton>
        <ContinueButton
          onClick={() => onContinue(selected)}
          disabled={selected.length === 0}
        >
          Continue
        </ContinueButton>
      </motion.div>
    </div>
  );
}
