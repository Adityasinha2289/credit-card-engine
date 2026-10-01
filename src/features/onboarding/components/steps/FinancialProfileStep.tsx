import React, { useState, useRef, useEffect } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface FinancialProfileStepProps {
  onBack: () => void;
  onContinue: (salary: number, creditScore: number) => void;
  initialSalary?: number;
  initialCreditScore?: number;
}

const SALARY_PRESETS = [
  { label: '₹3L', value: 300000 },
  { label: '₹5L', value: 500000 },
  { label: '₹8L', value: 800000 },
  { label: '₹12L', value: 1200000 },
  { label: '₹20L', value: 2000000 },
];

const formatINR = (val: string) => {
  if (!val) return '';
  const num = parseInt(val, 10);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-IN').format(num);
};

export function FinancialProfileStep({ onBack, onContinue, initialSalary, initialCreditScore }: FinancialProfileStepProps) {
  const [salary, setSalary] = useState<string>(initialSalary ? initialSalary.toString() : '');
  const [creditScore, setCreditScore] = useState<string>(initialCreditScore ? initialCreditScore.toString() : '');
  const [showCibilInfo, setShowCibilInfo] = useState(false);
  
  const salaryInputRef = useRef<HTMLInputElement>(null);

  const scoreNum = Number(creditScore);
  const isScoreError = creditScore.trim().length > 0 && (isNaN(scoreNum) || scoreNum < 300 || scoreNum > 900);
  const isValid = salary.trim().length > 0 && creditScore.trim().length > 0 && !isNaN(Number(salary)) && !isScoreError;

  const handleContinue = () => {
    if (isValid) {
      onContinue(Number(salary), Number(creditScore));
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const rawValue = target.value.replace(/[^0-9]/g, '');
    
    // Store cursor position and lengths before update to manually restore cursor
    const cursorBefore = target.selectionStart || 0;
    const lengthBefore = target.value.length;
    
    setSalary(rawValue);
    
    // Defer cursor restoration until after React re-renders the input with the new formatted value
    window.requestAnimationFrame(() => {
      if (salaryInputRef.current) {
        const lengthAfter = salaryInputRef.current.value.length;
        const cursorAfter = cursorBefore + (lengthAfter - lengthBefore);
        salaryInputRef.current.setSelectionRange(cursorAfter, cursorAfter);
      }
    });
  };

  const getCibilPercentage = () => {
    if (!scoreNum || scoreNum < 300) return 0;
    if (scoreNum > 900) return 100;
    return ((scoreNum - 300) / 600) * 100;
  };

  return (
    <div className="flex flex-col w-full">
      <SectionHeading className="mb-3">
        Your Financial Baseline
      </SectionHeading>
      <SectionDescription className="mb-12">
        TAQDEER uses this to tailor your card recommendations to your profile.
      </SectionDescription>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-14">
        
        {/* LEFT COLUMN: SALARY */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-[13px] font-bold tracking-widest uppercase text-[#4B5563] mb-2">
              Annual Income
            </h3>
            <p className="text-sm text-[#6B7280]">How much do you earn in a year?</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {SALARY_PRESETS.map((preset) => {
              const isSelected = salary === preset.value.toString();
              return (
                <button
                  key={preset.value}
                  onClick={() => setSalary(preset.value.toString())}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                    isSelected
                      ? 'bg-[#2A9D5C] text-white shadow-md'
                      : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Enter Exactly
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827] font-semibold text-xl select-none">
                ₹
              </span>
              <input
                ref={salaryInputRef}
                type="text"
                inputMode="numeric"
                value={salary ? formatINR(salary) : ''}
                onChange={handleSalaryChange}
                placeholder="15,00,000"
                className="w-full bg-[#FFFFFF] border-2 border-[#F3F4F6] rounded-2xl pl-10 pr-4 py-4 text-[#111827] font-semibold text-xl outline-none transition-all focus:border-[#2A9D5C] focus:bg-white shadow-sm"
              />
            </div>
            {salary.trim().length === 0 && (
              <p className="text-[#9CA3AF] text-xs mt-2">Enter your annual income.</p>
            )}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: CIBIL SCORE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-[13px] font-bold tracking-widest uppercase text-[#4B5563] mb-2">
                CIBIL Score
              </h3>
              <p className="text-sm text-[#6B7280]">Your latest CIBIL score, if you know it.</p>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowCibilInfo(!showCibilInfo)}
                className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors p-1"
                aria-label="What is CIBIL?"
              >
                <Info size={16} />
              </button>
              {showCibilInfo && (
                <div className="absolute right-0 top-8 w-56 p-3 bg-[#111827] text-white text-xs rounded-lg shadow-xl z-10">
                  CIBIL score is a 300–900 credit score used in India to represent creditworthiness.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-white border-2 border-[#F3F4F6] rounded-3xl py-10 px-6 shadow-sm relative overflow-hidden transition-colors focus-within:border-[#2A9D5C]">
            <input
              type="text"
              inputMode="numeric"
              value={creditScore}
              onChange={(e) => setCreditScore(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              placeholder="750"
              className="w-full text-center bg-transparent text-[#111827] font-display text-5xl md:text-6xl font-bold outline-none placeholder:text-[#D1D5DB]"
            />

            {/* Visual Scale Indicator */}
            <div className="w-full max-w-[280px] mt-10 relative">
              <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-[#2A9D5C] rounded-full transition-all duration-500 ease-out origin-left"
                  style={{ width: `${getCibilPercentage()}%` }}
                />
              </div>
              
              {/* Scale Markers */}
              <div className="flex justify-between w-full mt-3 text-[10px] font-bold text-[#9CA3AF]">
                <span>300</span>
                <span>600</span>
                <span>750</span>
                <span>900</span>
              </div>
              
              {/* Dynamic Dot */}
              {scoreNum >= 300 && scoreNum <= 900 && (
                <div 
                  className="absolute top-1/2 -translate-y-[calc(50%+12px)] w-4 h-4 bg-white border-[3px] border-[#111827] rounded-full shadow-md transition-all duration-500 ease-out"
                  style={{ left: `calc(${getCibilPercentage()}% - 8px)` }}
                />
              )}
            </div>
          </div>

          {isScoreError && (
            <p className="text-red-500 text-xs font-medium mt-3 px-2">
              Enter a score between 300 and 900.
            </p>
          )}
          {creditScore.trim().length === 0 && !isScoreError && (
            <p className="text-[#9CA3AF] text-xs mt-3 px-2">
              Enter your CIBIL score.
            </p>
          )}
        </motion.div>

      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4 mt-auto"
      >
        <BackButton onClick={onBack}>Back</BackButton>
        <ContinueButton
          onClick={handleContinue}
          disabled={!isValid}
        >
          Continue
        </ContinueButton>
      </motion.div>
    </div>
  );
}
