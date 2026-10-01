import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, RotateCcw, ChevronDown, CheckCircle2 } from 'lucide-react';
import { WelcomeStep } from '../components/steps/WelcomeStep';
import { AgeStep } from '../components/steps/AgeStep';
import { LifestyleStep } from '../components/steps/LifestyleStep';
import { FinancialGoalsStep } from '../components/steps/FinancialGoalsStep';
import { FinancialProfileStep } from '../components/steps/FinancialProfileStep';
import { CurrentCardsStep } from '../components/steps/CurrentCardsStep';

export interface DemoOnboardingState {
  age?: string;
  priorities: string[];
  goal?: string;
  salary?: number;
  creditScore?: number;
  banks: string[];
}

const DEMO_STORAGE_KEY = 'renocred-demo-onboarding';
const INITIAL_STATE: DemoOnboardingState = { priorities: [], banks: [] };

export function DemoOnboarding() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<DemoOnboardingState>(INITIAL_STATE);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showMobileInspector, setShowMobileInspector] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed.state || INITIAL_STATE);
        setStep(parsed.step || 0);
        setIsCompleted(parsed.isCompleted || false);
      } catch (e) {
        console.error('Failed to parse demo state', e);
      }
    }
  }, []);

  // Save to session storage
  useEffect(() => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ state, step, isCompleted }));
  }, [state, step, isCompleted]);

  const handleNext = (updates: Partial<DemoOnboardingState>) => {
    setDirection('forward');
    setState(prev => ({ ...prev, ...updates }));
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setDirection('backward');
    setStep(s => Math.max(0, s - 1));
  };

  const handleFinish = (finalUpdates: Partial<DemoOnboardingState>) => {
    setState(prev => ({ ...prev, ...finalUpdates }));
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setDirection('backward');
    setState(INITIAL_STATE);
    setStep(0);
    setIsCompleted(false);
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
  };

  // Variants for Framer Motion
  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -20 : 20,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#F9FAFB] font-sans overflow-hidden">
      
      {/* LEFT AREA: Onboarding Interface */}
      <div className="flex-1 flex flex-col relative h-[100dvh] lg:h-auto z-10 bg-[#F9FAFB]">
        {/* Header */}
        <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
          <div className="font-serif text-xl text-[#111827] tracking-tight flex items-center gap-3">
             renocred
             <span className="text-[10px] uppercase tracking-widest font-sans font-bold bg-[#2A9D5C]/10 text-[#2A9D5C] px-2 py-1 rounded-full">
               Demo Mode
             </span>
          </div>
          {!isCompleted && step > 0 && (
            <div className="text-sm font-medium text-[#6B7280]">
              {String(step).padStart(2, '0')} / 06
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-xl mx-auto">
            {isCompleted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center p-8 bg-white rounded-[2rem] border border-[#E5E7EB] shadow-xl"
              >
                <div className="w-16 h-16 rounded-full bg-[#2A9D5C]/10 flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} className="text-[#2A9D5C]" />
                </div>
                <h2 className="text-2xl font-serif text-[#111827] mb-2">Onboarding Preview Complete</h2>
                <p className="text-[#6B7280] text-sm mb-8">This demo does not save data to production. You can review your input in the data inspector.</p>
                <button 
                  onClick={handleRestart}
                  className="bg-[#111827] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#2A9D5C] transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Restart Demo
                </button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
                  className="w-full"
                >
                  {step === 0 && <WelcomeStep onContinue={() => handleNext({})} />}
                  {step === 1 && <AgeStep initialValue={state.age} onBack={handleBack} onContinue={(age) => handleNext({ age })} />}
                  {step === 2 && <LifestyleStep initialValues={state.priorities} onBack={handleBack} onContinue={(priorities) => handleNext({ priorities })} />}
                  {step === 3 && <FinancialGoalsStep initialValue={state.goal} onBack={handleBack} onContinue={(goal) => handleNext({ goal })} />}
                  {step === 4 && <FinancialProfileStep initialSalary={state.salary} initialCreditScore={state.creditScore} onBack={handleBack} onContinue={(salary, creditScore) => handleNext({ salary, creditScore })} />}
                  {step === 5 && <CurrentCardsStep initialValues={state.banks} onBack={handleBack} onContinue={(banks) => handleFinish({ banks })} />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* RIGHT AREA: Data Inspector (Desktop) */}
      <div className="hidden lg:flex w-[320px] xl:w-[380px] bg-white border-l border-[#E5E7EB] flex-col relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] h-[100dvh]">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center gap-2">
          <Database size={16} className="text-[#2A9D5C]" />
          <h3 className="font-semibold text-[#111827] tracking-tight">Demo Data Inspector</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <InspectorField label="Age" value={state.age} />
          <InspectorField label="Spending priorities" value={state.priorities.length > 0 ? state.priorities.join(' · ') : undefined} />
          <InspectorField label="Goal" value={state.goal} />
          <InspectorField label="Salary" value={state.salary ? `₹${state.salary.toLocaleString('en-IN')}` : undefined} />
          <InspectorField label="Credit Score" value={state.creditScore} />
          <InspectorField label="Selected Cards" value={state.banks.length > 0 ? `${state.banks.length} selected` : 'None'} />

          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <details className="group">
              <summary className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider cursor-pointer list-none flex justify-between items-center outline-none">
                Raw JSON
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
              </summary>
              <pre className="mt-4 p-4 bg-[#F3F4F6] rounded-xl text-[10px] text-[#4B5563] overflow-x-auto font-mono">
                {JSON.stringify(state, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>

      {/* MOBILE: Data Inspector Toggle */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
        <button 
          onClick={() => setShowMobileInspector(!showMobileInspector)}
          className="w-full bg-[#111827] text-white p-4 font-medium flex justify-between items-center shadow-lg rounded-t-2xl"
        >
          <span className="flex items-center gap-2"><Database size={16} className="text-[#2A9D5C]" /> Demo Data Inspector</span>
          <ChevronDown size={18} className={showMobileInspector ? '' : 'rotate-180 transition-transform'} />
        </button>

        <AnimatePresence>
          {showMobileInspector && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '50vh', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-t border-[#374151] overflow-y-auto"
            >
              <div className="p-6 flex flex-col gap-5">
                <InspectorField label="Age" value={state.age} />
                <InspectorField label="Spending priorities" value={state.priorities.length > 0 ? state.priorities.join(' · ') : undefined} />
                <InspectorField label="Goal" value={state.goal} />
                <InspectorField label="Salary" value={state.salary ? `₹${state.salary.toLocaleString('en-IN')}` : undefined} />
                <InspectorField label="Credit Score" value={state.creditScore} />
                <InspectorField label="Selected Cards" value={state.banks.length > 0 ? `${state.banks.length} selected` : 'None'} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

function InspectorField({ label, value }: { label: string, value: string | number | undefined }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </div>
      <div className={`text-sm font-medium ${value ? 'text-[#111827]' : 'text-[#D1D5DB] italic'}`}>
        {value !== undefined ? value : 'Not collected'}
      </div>
    </div>
  );
}
