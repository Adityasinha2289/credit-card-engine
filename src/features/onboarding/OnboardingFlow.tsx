import React, { useState, useCallback } from 'react';
import { OnboardingLayout } from './components/primitives/OnboardingLayout';
import { WelcomeStep } from './components/steps/WelcomeStep';
import { AgeStep } from './components/steps/AgeStep';
import { LifestyleStep } from './components/steps/LifestyleStep';
import { FinancialGoalsStep } from './components/steps/FinancialGoalsStep';
import { CurrentCardsStep } from './components/steps/CurrentCardsStep';
import { FinancialProfileStep } from './components/steps/FinancialProfileStep';
import { InitializationStep } from './components/steps/InitializationStep';
import { FinalLoadingStep } from './components/steps/FinalLoadingStep';
import { useDashboardStore } from '../dashboard/store/dashboardStore';
import { motion, AnimatePresence } from 'framer-motion';

export interface OnboardingState {
  age?: string;
  priorities?: string[];
  goal?: string;
  salary?: number;
  creditScore?: number;
  banks?: string[];
}

// Transition messages between steps — TAQDEER "thinking"
const TRANSITION_MESSAGES: Record<string, string> = {
  '0->1': 'Understanding your lifestyle...',
  '1->2': 'Mapping spending behaviour...',
  '2->3': 'Preparing recommendations...',
  '3->4': 'Finding the best reward categories...',
  '4->5': 'Analyzing financial baseline...',
  '5->6': 'Building your financial profile...',
};

export function OnboardingFlow({ onComplete }: { onComplete: (state: OnboardingState) => void }) {
  const [step, setStep] = useState(0); // 0: Welcome, 1-5: Steps
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');
  const [state, setState] = useState<OnboardingState>({});

  const handleFinish = useCallback((finalState: OnboardingState) => {
    onComplete(finalState);
  }, [onComplete]);

  const transitionTo = useCallback((from: number, to: number, overrideMsg?: string) => {
    setStep(to);
  }, []);

  const goNext = useCallback((from: number) => {
    transitionTo(from, from + 1);
  }, [transitionTo]);

  const goBack = useCallback(() => {
    setStep(s => Math.max(s - 1, 0));
  }, []);

  // === Transition interstitial ===
  if (isTransitioning) {
    return (
      <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#050606' }}
      >
        <motion.div
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center gap-8 z-10"
        >
          {/* Subtle spinner */}
          <div className="w-10 h-10 rounded-full" 
            style={{ 
              border: '2px solid #232626',
              borderTopColor: '#5D8F74',
              animation: 'spin 0.8s linear infinite',
            }} 
          />
          <p className="font-display text-base font-medium tracking-wide"
            style={{ color: '#A4A8A6' }}
          >
            {transitionMessage}
          </p>
        </motion.div>
      </div>
    );
  }

  // === Initialization (full-screen, no layout shell) ===
  if (step === -1) {
    return <InitializationStep onComplete={() => setStep(0)} />;
  }

  // === Final loading (full-screen, no layout shell) ===
  if (step === 6) {
    return <FinalLoadingStep />;
  }

  // === Main onboarding steps (inside layout shell) ===
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <WelcomeStep onContinue={() => goNext(0)} />
        );
      case 1:
        return (
          <AgeStep
            initialValue={state.age}
            onBack={goBack}
            onContinue={(age) => {
              setState(s => ({ ...s, age }));
              goNext(1);
            }}
          />
        );
      case 2:
        return (
          <LifestyleStep
            initialValues={state.priorities}
            onBack={goBack}
            onContinue={(priorities) => {
              setState(s => ({ ...s, priorities }));
              goNext(2);
            }}
          />
        );
      case 3:
        return (
          <FinancialGoalsStep
            initialValue={state.goal}
            onBack={goBack}
            onContinue={(goal) => {
              setState(s => ({ ...s, goal }));
              goNext(3);
            }}
          />
        );
      case 4:
        return (
          <FinancialProfileStep
            initialSalary={state.salary}
            initialCreditScore={state.creditScore}
            onBack={goBack}
            onContinue={(salary, creditScore) => {
              setState(s => ({ ...s, salary, creditScore }));
              goNext(4);
            }}
          />
        );
      case 5:
        return (
          <CurrentCardsStep
            initialValues={state.banks}
            onBack={goBack}
            onContinue={(banks) => {
              const finalState = { ...state, banks };
              setState(finalState);
              handleFinish(finalState);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      stepKey={`step-${step}`}
      currentStep={step}
      totalSteps={5}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
