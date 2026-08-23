import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
  Plane, Utensils, ShoppingBag, Dumbbell,
  BookOpen, Tv, HeartPulse, Laptop,
  Shirt, Home, Fuel, ShoppingCart,
  Camera, Coffee, Gamepad2, Dog
} from 'lucide-react';

const PRIORITIES = [
  { id: 'Travel', title: 'Travel', subtitle: 'Flights, hotels, road trips', caption: 'Optimize travel rewards.', icon: Plane },
  { id: 'Dining', title: 'Dining', subtitle: 'Restaurants, cafes, weekend outings', caption: 'Unlock dining multipliers.', icon: Utensils },
  { id: 'Fitness', title: 'Fitness', subtitle: 'Gym, pilates, sports', caption: 'Find fitness offers.', icon: Dumbbell },
  { id: 'Shopping', title: 'Shopping', subtitle: 'Fashion, electronics, luxury', caption: 'Never overpay.', icon: ShoppingBag },
  { id: 'Learning', title: 'Learning', subtitle: 'Courses, books, certifications', caption: 'Invest in yourself.', icon: BookOpen },
  { id: 'Entertainment', title: 'Entertainment', subtitle: 'Streaming, movies, events', caption: 'Maximize entertainment value.', icon: Tv },
  { id: 'Healthcare', title: 'Healthcare', subtitle: 'Medical, pharmacy, insurance', caption: 'Protect what matters.', icon: HeartPulse },
  { id: 'Technology', title: 'Technology', subtitle: 'Gadgets, software, subscriptions', caption: 'Smart tech spending.', icon: Laptop },
  { id: 'Fashion', title: 'Fashion', subtitle: 'Clothing, accessories, luxury', caption: 'Style with rewards.', icon: Shirt },
  { id: 'Home', title: 'Home', subtitle: 'Furniture, decor, utilities', caption: 'Build your space.', icon: Home },
  { id: 'Fuel', title: 'Fuel', subtitle: 'Petrol, diesel, EV charging', caption: 'Save on every fill.', icon: Fuel },
  { id: 'Groceries', title: 'Groceries', subtitle: 'Daily essentials, supermarkets', caption: 'Everyday savings.', icon: ShoppingCart },
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

  return (
    <div className="flex flex-col w-full">
      <SectionHeading className="mb-3">
        Tell me what matters most.
      </SectionHeading>
      <SectionDescription className="mb-2">
        We'll optimize your card recommendations around your lifestyle.
      </SectionDescription>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-sm mb-6 md:mb-10"
        style={{ color: '#6B7280' }}
      >
        Choose up to five.
      </motion.p>

      <div className="flex flex-wrap md:grid md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-14 max-h-[52vh] overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E7EB transparent' }}
      >
        {PRIORITIES.map((item, idx) => {
          const isSelected = selected.includes(item.id);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => toggleSelection(item.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className="relative px-3 py-2 md:p-5 rounded-full md:rounded-[20px] text-left transition-all duration-300 group flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-3 w-fit md:w-auto"
              style={{
                backgroundColor: isSelected ? '#F9FAFB' : '#FFFFFF',
                border: `1px solid ${isSelected ? '#2A9D5C' : '#E5E7EB'}`,
                boxShadow: isSelected ? '0 4px 20px rgba(42,157,92,0.12)' : 'none',
              }}
            >
              {/* Selection checkmark */}
              <motion.div
                className="hidden md:flex absolute top-4 right-4 w-5 h-5 rounded-full items-center justify-center"
                initial={false}
                animate={{
                  opacity: isSelected ? 1 : 0,
                  scale: isSelected ? 1 : 0.3,
                  backgroundColor: isSelected ? '#2A9D5C' : 'transparent',
                }}
                transition={{ duration: 0.2 }}
              >
                <Check size={11} strokeWidth={3} color="#FFFFFF" />
              </motion.div>

              <div className="w-6 h-6 md:w-9 md:h-9 rounded-full md:rounded-xl flex shrink-0 items-center justify-center transition-colors duration-300"
                style={{
                  backgroundColor: isSelected ? 'rgba(42,157,92,0.15)' : '#F3F4F6',
                }}
              >
                <Icon className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" strokeWidth={1.5}
                  style={{ color: isSelected ? '#2A9D5C' : '#6B7280' }}
                />
              </div>

              <div>
                <h4 className="text-[13px] md:text-[15px] font-semibold tracking-tight transition-colors duration-300"
                  style={{ color: isSelected ? '#111827' : '#4B5563' }}
                >
                  {item.title}
                </h4>
                <p className="hidden md:block text-xs mt-1 leading-relaxed" style={{ color: '#6B7280' }}>
                  {item.subtitle}
                </p>
              </div>

              <p className="hidden md:block text-xs" style={{ color: isSelected ? '#2A9D5C' : '#9CA3AF' }}>
                {item.caption}
              </p>
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
          onClick={() => onContinue(selected)}
          disabled={selected.length === 0}
        >
          Continue
        </ContinueButton>
      </motion.div>
    </div>
  );
}
