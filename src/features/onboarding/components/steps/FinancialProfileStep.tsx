import React, { useState } from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton, BackButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';

interface FinancialProfileStepProps {
  onBack: () => void;
  onContinue: (salary: number, creditScore: number) => void;
  initialSalary?: number;
  initialCreditScore?: number;
}

export function FinancialProfileStep({ onBack, onContinue, initialSalary, initialCreditScore }: FinancialProfileStepProps) {
  const [salary, setSalary] = useState<string>(initialSalary ? initialSalary.toString() : '');
  const [creditScore, setCreditScore] = useState<string>(initialCreditScore ? initialCreditScore.toString() : '');
  
  const scoreNum = Number(creditScore);
  const isScoreError = creditScore.trim().length > 0 && (isNaN(scoreNum) || scoreNum < 300 || scoreNum > 900);
  const isValid = salary.trim().length > 0 && creditScore.trim().length > 0 && !isNaN(Number(salary)) && !isScoreError;

  const handleContinue = () => {
    if (isValid) {
      onContinue(Number(salary), Number(creditScore));
    }
  };

  return (
    <div className="flex flex-col w-full">
      <SectionHeading className="mb-3">
        Your Financial Baseline
      </SectionHeading>
      <SectionDescription className="mb-12">
        TAQDEER uses this to recommend cards you have a high probability of getting approved for.
      </SectionDescription>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <label className="text-sm font-semibold tracking-wide mb-3" style={{ color: '#4B5563' }}>
            Annual Income (INR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium">₹</span>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 1500000"
              className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl pl-8 pr-4 py-4 text-[#111827] font-medium outline-none transition-all focus:border-[#2A9D5C]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <label className="text-sm font-semibold tracking-wide mb-3" style={{ color: '#4B5563' }}>
            Estimated CIBIL Score
          </label>
          <input
            type="text"
            value={creditScore}
            onChange={(e) => setCreditScore(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
            placeholder="e.g. 750"
            className={`w-full bg-[#FFFFFF] border rounded-xl px-4 py-4 text-[#111827] font-medium outline-none transition-all ${
              isScoreError ? 'border-red-500 focus:border-red-600' : 'border-[#E5E7EB] focus:border-[#2A9D5C]'
            }`}
          />
          {isScoreError && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} 
              className="text-red-500 text-xs font-medium mt-2"
            >
              Invalid CIBIL score (must be 300-900)
            </motion.p>
          )}
        </motion.div>

      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4"
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
