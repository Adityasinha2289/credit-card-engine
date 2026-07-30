import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '../store/dashboardStore';
import {
  Sparkles,
  CreditCard,
  Briefcase,
  GraduationCap,
  Coffee,
  ShoppingBag,
  Plane,
  Fuel,
  Receipt,
  ShoppingCart,
  Ticket,
  Globe,
  Scan,
  MessageSquare,
  Edit3,
  SkipForward,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

type OnboardingStep = 
  | 'intro'
  | 'wallet_status'
  | 'demographic'
  | 'spend_category'
  | 'spend_amount'
  | 'add_method'
  | 'ai_thinking'
  | 'dna_reveal';

const SPEND_CATEGORIES = [
  { id: 'Dining', icon: Coffee },
  { id: 'Shopping', icon: ShoppingBag },
  { id: 'Travel', icon: Plane },
  { id: 'Fuel', icon: Fuel },
  { id: 'Bills', icon: Receipt },
  { id: 'Groceries', icon: ShoppingCart },
  { id: 'Entertainment', icon: Ticket },
  { id: 'Everything', icon: Globe },
];

const SPEND_AMOUNTS = ['₹15k', '₹30k', '₹60k', '₹1L+', 'Prefer not to say'];

const DEMOGRAPHICS = [
  { id: 'Student', icon: GraduationCap },
  { id: 'Young Professional', icon: Briefcase },
  { id: 'Working Professional', icon: Briefcase },
  { id: 'Business Owner', icon: ShieldCheck },
];

const ADD_METHODS = [
  { id: 'scan', label: 'Scan Cards', icon: Scan },
  { id: 'sms', label: 'Import from SMS', icon: MessageSquare },
  { id: 'manual', label: 'Add Manually', icon: Edit3 },
  { id: 'skip', label: 'Skip for now', icon: SkipForward },
];

const AI_STEPS = [
  "Reading reward structures...",
  "Analysing spending behaviour...",
  "Matching 250+ credit cards...",
  "Calculating hidden offers...",
  "Optimising reward strategy...",
  "Estimating yearly savings..."
];

export function PremiumOnboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<OnboardingStep>('intro');
  const [walletStatus, setWalletStatus] = useState<'first' | 'existing' | null>(null);
  const [demographic, setDemographic] = useState<string | null>(null);
  const [spendCategories, setSpendCategories] = useState<string[]>([]);
  const [spendAmount, setSpendAmount] = useState<string | null>(null);
  
  const [aiStepIndex, setAiStepIndex] = useState(0);

  // Cinematic Intro Timing
  useEffect(() => {
    if (step === 'intro') {
      const t = setTimeout(() => setStep('wallet_status'), 4000);
      return () => clearTimeout(t);
    }
  }, [step]);

  // AI Thinking Timing
  useEffect(() => {
    if (step === 'ai_thinking') {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current >= AI_STEPS.length) {
          clearInterval(interval);
          setStep('dna_reveal');
        } else {
          setAiStepIndex(current);
        }
      }, 800); // 4.8 seconds total
      return () => clearInterval(interval);
    }
  }, [step]);

  // Background atmosphere based on spend category
  let atmosphereClass = 'bg-canvas-50 dark:bg-canvas-100'; // default
  if (spendCategories.length > 0) {
    const lastCategory = spendCategories[spendCategories.length - 1];
    if (lastCategory === 'Dining') atmosphereClass = 'bg-[#1a1510]';
    if (lastCategory === 'Shopping') atmosphereClass = 'bg-[#15101a]';
    if (lastCategory === 'Travel') atmosphereClass = 'bg-[#0a101f]';
    if (lastCategory === 'Fuel') atmosphereClass = 'bg-[#0f1f15]';
    if (lastCategory === 'Bills') atmosphereClass = 'bg-[#151618]';
    if (lastCategory === 'Groceries') atmosphereClass = 'bg-[#0c1f17]';
    if (lastCategory === 'Entertainment') atmosphereClass = 'bg-[#1f1012]';
  }

  const handleWalletSelect = (type: 'first' | 'existing') => {
    setWalletStatus(type);
    if (type === 'first') setStep('demographic');
    else setStep('spend_category');
  };

  const handleDemographicSelect = (demo: string) => {
    setDemographic(demo);
    setStep('spend_category');
  };

  const handleSpendCategorySelect = (cat: string) => {
    setSpendCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSpendAmountSelect = (amount: string) => {
    setSpendAmount(amount);
    if (walletStatus === 'existing') {
      setStep('add_method');
    } else {
      setStep('ai_thinking');
    }
  };

  const handleAddMethodSelect = (method: string) => {
    setStep('ai_thinking');
  };

  const handleFinish = async () => {
    const store = useDashboardStore.getState();
    const profile = store.profile;
    if (profile) {
      const updatedProfile = {
        ...profile,
        onboardingCompleted: true,
        spendCategories: spendCategories.length > 0 ? spendCategories : undefined,
        spendAmount: spendAmount || undefined,
        walletDna: 'Cashback Hunter',
      };
      
      await store.updateProfile(updatedProfile);
    }
    onComplete();
  };

  const showPhone = ['demographic', 'spend_category', 'spend_amount', 'add_method'].includes(step);

  return (
    <div className={cn("relative min-h-screen w-full flex items-center justify-center transition-colors duration-1000 overflow-hidden", atmosphereClass)}>
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />

      {/* Progress Indicator */}
      {showPhone && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-ink-tertiary">Wallet Intelligence</span>
          <div className="flex gap-1">
            {['demographic', 'spend_category', 'spend_amount', 'add_method'].map((s, i) => {
              const stepOrder = ['intro', 'wallet_status', 'demographic', 'spend_category', 'spend_amount', 'add_method', 'ai_thinking', 'dna_reveal'];
              const currentIdx = stepOrder.indexOf(step);
              const thisIdx = stepOrder.indexOf(s);
              const isActive = currentIdx >= thisIdx;
              // If it's a first card user, add_method is skipped, so don't render that dot
              if (s === 'add_method' && walletStatus === 'first') return null;
              // If existing user, demographic is skipped, don't render that dot
              if (s === 'demographic' && walletStatus === 'existing') return null;
              
              return (
                <div key={i} className={cn("w-6 h-1 rounded-full transition-colors duration-500", isActive ? "bg-[#2E8B6B]" : "bg-white/10")} />
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="relative z-10 w-full max-w-6xl px-6 flex items-center justify-between min-h-[500px]">
        
        {/* Left Side: Content */}
        <div className={cn("flex-1 flex flex-col justify-center", showPhone ? "items-start pr-12 max-w-xl" : "items-center text-center")}>
          <AnimatePresence mode="wait">
            
            {/* INTRO */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center gap-6 w-full"
              >
                <div className="w-20 h-20 rounded-[24px] bg-black flex items-center justify-center border border-[#2E8B6B]/20 shadow-ag-glow-primary overflow-hidden">
                  <img src="/logo.jpg" alt="RenoCred" className="w-full h-full object-cover" />
                </div>
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-2xl lg:text-4xl font-display font-bold text-ink-primary"
                  >
                    Welcome to RenoCred.
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="text-sm lg:text-lg text-ink-secondary mt-3"
                  >
                    Let's build your financial intelligence.
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5, duration: 0.8 }}
                    className="text-[11px] text-[#2E8B6B] mt-12 font-bold tracking-[0.3em] uppercase"
                  >
                    TAQDEER AI joining the conversation...
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* WALLET STATUS */}
            {step === 'wallet_status' && (
              <motion.div
                key="wallet_status"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center w-full max-w-2xl text-center mx-auto"
              >
                <h2 className="text-2xl lg:text-4xl font-display font-bold text-ink-primary tracking-tight">
                  Before I optimise your wallet...
                </h2>
                <p className="text-sm lg:text-base text-ink-secondary mt-3 mb-12">
                  Tell me where we're starting.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  <button
                    onClick={() => handleWalletSelect('first')}
                    className="p-8 rounded-[32px] border border-canvas-300 dark:border-white/5 bg-canvas-50 dark:bg-canvas-200/40 text-left hover:border-[#2E8B6B]/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-canvas-200/50 dark:bg-white/[0.03] flex items-center justify-center mb-6 group-hover:text-[#2E8B6B] group-hover:bg-[#2E8B6B]/10 transition-colors">
                      <Sparkles size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-ink-primary tracking-tight">Find my first credit card</h3>
                    <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                      I don't own a credit card yet. Let's find the perfect match.
                    </p>
                  </button>
                  <button
                    onClick={() => handleWalletSelect('existing')}
                    className="p-8 rounded-[32px] border border-canvas-300 dark:border-white/5 bg-canvas-50 dark:bg-canvas-200/40 text-left hover:border-[#2E8B6B]/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-canvas-200/50 dark:bg-white/[0.03] flex items-center justify-center mb-6 group-hover:text-[#2E8B6B] group-hover:bg-[#2E8B6B]/10 transition-colors">
                      <CreditCard size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-ink-primary tracking-tight">I already have credit cards</h3>
                    <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                      Help me optimise what I already own.
                    </p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* DEMOGRAPHIC (First Card Only) */}
            {step === 'demographic' && (
              <motion.div
                key="demographic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col w-full"
              >
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink-primary tracking-tight mb-8">
                  Which best describes you?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DEMOGRAPHICS.map(demo => {
                    const Icon = demo.icon;
                    return (
                      <button
                        key={demo.id}
                        onClick={() => handleDemographicSelect(demo.id)}
                        className="p-6 rounded-[24px] border border-canvas-300 dark:border-white/5 bg-canvas-50 dark:bg-canvas-200/40 text-left hover:border-[#2E8B6B]/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group flex flex-col gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-canvas-200/50 dark:bg-white/[0.03] flex items-center justify-center group-hover:text-[#2E8B6B] transition-colors">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-base font-bold text-ink-primary">{demo.id}</h3>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* SPEND CATEGORY */}
            {step === 'spend_category' && (
              <motion.div
                key="spend_category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col w-full"
              >
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink-primary tracking-tight mb-8">
                  What do you spend the most on?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SPEND_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = spendCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSpendCategorySelect(cat.id)}
                        className={cn(
                          "p-5 rounded-[20px] border text-center transition-all duration-500 flex flex-col items-center justify-center gap-3 cursor-pointer",
                          isSelected
                            ? "bg-[#2E8B6B]/10 border-[#2E8B6B] shadow-[0_4px_14px_0_rgba(46,139,107,0.08)] scale-[1.02]"
                            : "bg-canvas-50 dark:bg-canvas-200/40 border-canvas-300 dark:border-white/5 hover:border-[#2E8B6B]/30 hover:-translate-y-1"
                        )}
                      >
                        <Icon size={24} className={isSelected ? "text-[#2E8B6B]" : "text-ink-tertiary"} />
                        <span className="text-xs font-bold text-ink-primary">{cat.id}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-8 flex justify-center w-full">
                  <button
                    onClick={() => setStep('spend_amount')}
                    disabled={spendCategories.length === 0}
                    className="btn-primary py-3 px-10 flex items-center gap-2 shadow-ag-glow-primary active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* SPEND AMOUNT */}
            {step === 'spend_amount' && (
              <motion.div
                key="spend_amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col w-full"
              >
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink-primary tracking-tight mb-8">
                  Which feels closest to your monthly spending?
                </h2>
                <div className="flex flex-col gap-3 w-full max-w-md">
                  {SPEND_AMOUNTS.map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleSpendAmountSelect(amount)}
                      className="p-5 rounded-[20px] border border-canvas-300 dark:border-white/5 bg-canvas-50 dark:bg-canvas-200/40 text-left hover:border-[#2E8B6B]/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group flex justify-between items-center"
                    >
                      <span className="text-base font-bold text-ink-primary">{amount}</span>
                      <ChevronRight size={18} className="text-ink-tertiary group-hover:text-[#2E8B6B] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ADD METHOD (Existing Only) */}
            {step === 'add_method' && (
              <motion.div
                key="add_method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col w-full"
              >
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink-primary tracking-tight mb-8">
                  How would you like to add your cards?
                </h2>
                <div className="flex flex-col gap-3 w-full max-w-md">
                  {ADD_METHODS.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => handleAddMethodSelect(method.id)}
                        className="p-5 rounded-[20px] border border-canvas-300 dark:border-white/5 bg-canvas-50 dark:bg-canvas-200/40 text-left hover:border-[#2E8B6B]/40 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-canvas-200/50 dark:bg-white/[0.03] flex items-center justify-center group-hover:text-[#2E8B6B] transition-colors">
                          <Icon size={20} />
                        </div>
                        <span className="text-base font-bold text-ink-primary">{method.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* AI THINKING */}
            {step === 'ai_thinking' && (
              <motion.div
                key="ai_thinking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center gap-8 w-full mx-auto"
              >
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#2E8B6B] animate-spin opacity-40"></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-[#2E8B6B] animate-spin opacity-60" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src="/logo.jpg" alt="RenoCred" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-ink-primary mb-6">
                    Building your wallet intelligence...
                  </h2>
                  <div className="flex flex-col gap-3 items-center">
                    {AI_STEPS.map((stepText, idx) => {
                      if (idx > aiStepIndex) return null;
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: idx === aiStepIndex ? 1 : 0.4, y: 0 }}
                          className="flex items-center gap-3"
                        >
                          {idx < aiStepIndex ? (
                            <CheckCircle2 size={16} className="text-[#2E8B6B]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2E8B6B] animate-pulse" />
                          )}
                          <span className="text-sm font-medium text-ink-secondary">{stepText}</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* DNA REVEAL */}
            {step === 'dna_reveal' && (
              <motion.div
                key="dna_reveal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center w-full mx-auto"
              >
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-ink-tertiary mb-6">
                  Your Wallet DNA
                </h2>
                
                <div className="relative w-full max-w-sm aspect-[4/5] rounded-[32px] bg-gradient-to-br from-[#2E8B6B]/20 to-black/40 border border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 mb-10 group">
                  <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#2E8B6B]/20 group-hover:opacity-100 opacity-50 transition-opacity duration-1000"></div>
                  
                  <div className="w-12 h-12 rounded-xl overflow-hidden mb-8 border border-white/10 shadow-ag-glow-primary">
                    <img src="/logo.jpg" alt="RenoCred" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-4xl font-display font-extrabold text-white mb-2 leading-tight">
                    Everyday<br />Optimiser
                  </h3>
                  <p className="text-sm text-white/60 mb-8">
                    Your spending profile is perfectly suited to maximise rewards on daily essentials.
                  </p>
                  
                  <div className="w-full grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5 backdrop-blur-md text-left">
                      <span className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Potential Savings</span>
                      <span className="text-lg font-bold text-[#2E8B6B]">₹24,500/yr</span>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5 backdrop-blur-md text-left">
                      <span className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">AI Confidence</span>
                      <span className="text-lg font-bold text-white">98%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="px-10 py-4 rounded-full bg-white text-black font-bold hover:bg-[#2E8B6B] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Enter Dashboard
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Side: Live iPhone Preview */}
        <AnimatePresence>
          {showPhone && (
            <motion.div 
              initial={{ opacity: 0, x: 40, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: -5 }}
              exit={{ opacity: 0, x: 40, rotateY: 15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block w-[320px] shrink-0"
              style={{ perspective: 1000 }}
            >
              <div className="relative w-full aspect-[1/2] rounded-[48px] border-[8px] border-black bg-canvas-100 overflow-hidden shadow-2xl flex flex-col transform-style-3d">
                {/* Dynamic Island */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20" />
                
                {/* iPhone Content */}
                <div className="flex-1 w-full bg-gradient-to-b from-[#1a1c20] to-[#0d0e12] p-6 pt-16 flex flex-col relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  </div>

                  <motion.div layout className="w-full bg-white/5 rounded-3xl p-5 mb-4 border border-white/10 backdrop-blur-md">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">AI Recommendation</span>
                    <h4 className="text-white font-bold mt-1">Smart Savings</h4>
                    
                    {/* Live Reaction to Selections */}
                    <AnimatePresence mode="popLayout">
                      {spendCategories.map(cat => (
                        <motion.div 
                          key={cat}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="mt-2 p-3 bg-black/40 rounded-xl border border-white/5 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#2E8B6B]/20 flex items-center justify-center text-[#2E8B6B]">
                            <Sparkles size={14} />
                          </div>
                          <div>
                            <span className="block text-[10px] text-white/50">Optimising for</span>
                            <span className="block text-xs font-bold text-white">{cat}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  <div className="w-full h-24 bg-white/5 rounded-3xl border border-white/10 mt-auto" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
