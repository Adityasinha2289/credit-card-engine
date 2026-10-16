import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plane, Utensils, ShoppingBag, ShoppingCart, Fuel, Tv, Zap, HeartPulse } from 'lucide-react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton } from '../primitives/Buttons';
import { PRIMARY_GOALS } from '../../../../config/goals';

/**
 * Step 1 of 2: one required choice (goal) and one optional one (where the
 * money goes). Replaces the old Welcome → Age → Lifestyle → Goal → Salary/CIBIL
 * sequence; age, income and credit score are asked later, only when a feature
 * needs them, and never block reaching the dashboard.
 */
const SPEND = [
  { id: 'dining', title: 'Food & dining', icon: Utensils },
  { id: 'groceries', title: 'Groceries', icon: ShoppingCart },
  { id: 'shopping', title: 'Online shopping', icon: ShoppingBag },
  { id: 'travel', title: 'Travel', icon: Plane },
  { id: 'fuel', title: 'Fuel', icon: Fuel },
  { id: 'utilities', title: 'Bills & recharges', icon: Zap },
  { id: 'entertainment', title: 'OTT & movies', icon: Tv },
  { id: 'health', title: 'Health & fitness', icon: HeartPulse },
];

interface QuickStartStepProps {
  initialGoal?: string;
  initialSpend?: string[];
  onContinue: (goal: string, spendCategories: string[]) => void;
}

export function QuickStartStep({ initialGoal, initialSpend = [], onContinue }: QuickStartStepProps) {
  const [goal, setGoal] = useState<string | undefined>(initialGoal);
  const [spend, setSpend] = useState<string[]>(initialSpend);

  const toggle = (id: string) =>
    setSpend((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-5)));

  return (
    <div className="flex flex-col w-full">
      <SectionHeading className="mb-2">What should RenoCred optimise for?</SectionHeading>
      <SectionDescription className="mb-5">Pick one. You can change it any time.</SectionDescription>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8" role="radiogroup" aria-label="Primary goal">
        {PRIMARY_GOALS.map((g) => {
          const selected = goal === g.id;
          const Icon = g.icon;
          return (
            <motion.button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setGoal(g.id)}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors"
              style={{
                backgroundColor: selected ? '#111827' : '#FFFFFF',
                border: `1px solid ${selected ? 'transparent' : '#E5E7EB'}`,
              }}
            >
              <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: selected ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}>
                <Icon size={18} style={{ color: selected ? '#FFFFFF' : '#4B5563' }} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold" style={{ color: selected ? '#FFFFFF' : '#111827' }}>{g.title}</span>
                <span className="block text-xs truncate" style={{ color: selected ? 'rgba(255,255,255,0.7)' : '#6B7280' }}>{g.description}</span>
              </span>
              {selected && <Check size={16} className="ml-auto shrink-0" color="#2A9D5C" strokeWidth={3} />}
            </motion.button>
          );
        })}
      </div>

      <p className="text-sm font-semibold mb-1" style={{ color: '#111827' }}>Where does most of your money go?</p>
      <p className="text-xs mb-3" style={{ color: '#6B7280' }}>Optional · up to 5 · helps us pick the right card for each spend</p>
      <div className="flex flex-wrap gap-2 mb-10">
        {SPEND.map((s) => {
          const on = spend.includes(s.id);
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(s.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: on ? '#111827' : '#FFFFFF',
                color: on ? '#FFFFFF' : '#374151',
                border: `1px solid ${on ? 'transparent' : '#E5E7EB'}`,
              }}
            >
              <Icon size={14} /> {s.title}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <ContinueButton disabled={!goal} onClick={() => goal && onContinue(goal, spend)}>
          Continue
        </ContinueButton>
      </div>
    </div>
  );
}
