import React from 'react';
import { SectionHeading, SectionDescription } from '../primitives/Typography';
import { ContinueButton } from '../primitives/Buttons';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-start w-full">
      <SectionHeading className="text-4xl md:text-5xl lg:text-[56px] leading-[1.1] mb-6">
        Welcome to RenoCred
      </SectionHeading>

      <SectionDescription className="mb-4">
        Your financial intelligence starts here.
      </SectionDescription>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="text-sm mb-16"
        style={{ color: '#6E7471' }}
      >
        We'll personalize everything in under a minute.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <ContinueButton onClick={onContinue}>
          Continue
        </ContinueButton>
      </motion.div>
    </div>
  );
}
