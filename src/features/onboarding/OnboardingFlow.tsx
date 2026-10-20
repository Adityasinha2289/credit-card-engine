import { useState } from 'react';
import { NextButton, OnboardingLayout } from './components/primitives/OnboardingLayout';
import { Ledger } from './components/Ledger';
import { GoalStep } from './components/steps/GoalStep';
import { SpendStep } from './components/steps/SpendStep';
import { WalletStep } from './components/steps/WalletStep';
import { ReadyStep } from './components/steps/ReadyStep';

export interface OnboardingState {
  age?: string;
  priorities?: string[];
  goal?: string;
  salary?: number;
  creditScore?: number;
  banks?: string[];
}

const QUESTIONS = 3;

/**
 * Three quick questions, then the payoff:
 *   1. Goal: one tap, moves on by itself
 *   2. Where the money goes: each spend shows the card that pays most for it
 *   3. Cards you already have (skippable): compared against the best as you add them
 *   4. Your first move: the card to use for each spend, then into the app
 *
 * A panel beside the questions fills in with what RenoCred has learned, so
 * every answer gets something back. Age, income and credit score are still
 * asked later in the app, only when a feature needs them.
 */
export function OnboardingFlow({ onComplete }: { onComplete: (state: OnboardingState) => void | Promise<void> }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [goal, setGoal] = useState<string>();
  const [spend, setSpend] = useState<string[]>([]);
  const [cards, setCards] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const go = (to: number) => { setDirection(to > step ? 1 : -1); setStep(to); window.scrollTo({ top: 0 }); };
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const open = async () => {
    setBusy(true);
    try { await onComplete({ goal, priorities: spend, banks: cards }); } catch { setBusy(false); }
  };

  const ledger = <Ledger goal={goal} spend={spend} cards={cards} />;

  if (step === 0) {
    return (
      <OnboardingLayout step={0} total={QUESTIONS} direction={direction} aside={ledger}>
        <GoalStep value={goal} onPick={(g) => { setGoal(g); go(1); }} />
      </OnboardingLayout>
    );
  }
  if (step === 1) {
    return (
      <OnboardingLayout
        step={1}
        total={QUESTIONS}
        direction={direction}
        onBack={() => go(0)}
        aside={ledger}
        footer={<NextButton onClick={() => go(2)}>{spend.length ? 'Continue' : 'Skip this'}</NextButton>}
      >
        <SpendStep goal={goal} value={spend} onToggle={(id) => setSpend((s) => toggle(s, id))} />
      </OnboardingLayout>
    );
  }
  if (step === 2) {
    return (
      <OnboardingLayout
        step={2}
        total={QUESTIONS}
        direction={direction}
        onBack={() => go(1)}
        aside={ledger}
        footer={<NextButton onClick={() => go(3)}>{cards.length ? `Continue with ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}` : 'Skip for now'}</NextButton>}
      >
        <WalletStep spendCount={spend.length} value={cards} onToggle={(id) => setCards((c) => toggle(c, id))} />
      </OnboardingLayout>
    );
  }
  return (
    <OnboardingLayout step={3} total={QUESTIONS} direction={direction} onBack={busy ? undefined : () => go(2)}>
      <ReadyStep spend={spend} cards={cards} busy={busy} onOpen={open} />
    </OnboardingLayout>
  );
}
