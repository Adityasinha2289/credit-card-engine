import { useState } from 'react';
import { OnboardingLayout } from './components/primitives/OnboardingLayout';
import { QuickStartStep } from './components/steps/QuickStartStep';
import { CurrentCardsStep } from './components/steps/CurrentCardsStep';

export interface OnboardingState {
  age?: string;
  priorities?: string[];
  goal?: string;
  salary?: number;
  creditScore?: number;
  banks?: string[];
}

/**
 * Two screens, then straight to the dashboard:
 *   1. Goal (+ optional spend categories)
 *   2. Cards you already have (skippable)
 *
 * Age, income and CIBIL are no longer gates. They are asked in-app ("Sharpen
 * your recommendations") when a feature actually needs them. The old 8.5 s
 * "personalising" screen is gone — the dashboard itself is the payoff.
 */
export function OnboardingFlow({ onComplete }: { onComplete: (state: OnboardingState) => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<OnboardingState>({});

  return (
    <OnboardingLayout stepKey={`step-${step}`} currentStep={step + 1} totalSteps={2} direction={direction}>
      {step === 0 ? (
        <QuickStartStep
          initialGoal={state.goal}
          initialSpend={state.priorities}
          onContinue={(goal, priorities) => {
            setState((s) => ({ ...s, goal, priorities }));
            setDirection(1);
            setStep(1);
          }}
        />
      ) : (
        <CurrentCardsStep
          initialValues={state.banks}
          onBack={() => { setDirection(-1); setStep(0); }}
          onContinue={(banks) => onComplete({ ...state, banks })}
        />
      )}
    </OnboardingLayout>
  );
}
