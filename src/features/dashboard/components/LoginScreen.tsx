import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Coins,
  Compass,
  PiggyBank,
  Award,
  Gift,
  CheckCircle2,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { AppProfile, UserSegment, PrimaryGoal, Occupation } from '../types/dashboard.types';
import { cn } from '../../../lib/utils';

const GOAL_OPTIONS: { id: PrimaryGoal; label: string; icon: any; description: string }[] = [
  { id: 'Maximise Cashback', label: 'Maximise Cashback', icon: Coins, description: 'Get maximum cash returns on your daily expenses' },
  { id: 'Travel Rewards', label: 'Travel Rewards', icon: Compass, description: 'Unlock lounge access, air miles & hotel perks' },
  { id: 'Save More Money', label: 'Save More Money', icon: PiggyBank, description: 'Optimize annual fees and reduce interest charges' },
  { id: 'Build Credit Score', label: 'Build Credit Score', icon: Award, description: 'Improve credit limits and CIBIL health rating' },
  { id: 'Earn Reward Points', label: 'Earn Reward Points', icon: Gift, description: 'Multiply reward multipliers across categories' },
];

const OCCUPATION_OPTIONS: Occupation[] = [
  'Student',
  'Salaried',
  'Self-employed',
  'Business Owner',
  'Other',
];

export function LoginScreen() {
  const { isSignedIn, user } = useUser();
  const login = useDashboardStore((s) => s.login);
  const resetStore = useDashboardStore((s) => s._reset);
  const [showBlog, setShowBlog] = useState(false);
  const [showLegal, setShowLegal] = useState<'privacy' | 'terms' | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [livePreviewName, setLivePreviewName] = useState('');
  const authPanelRef = useRef<HTMLDivElement>(null);

  // 3-step onboarding sequence state
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [userSegment, setUserSegment] = useState<UserSegment>('adult');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>('Maximise Cashback');
  const [occupation, setOccupation] = useState<Occupation | undefined>(undefined);
  const [city, setCity] = useState('');

  const salary = 1500000;
  const creditScore = 750;

  // Listen to hash changes to toggle between sign-in and sign-up
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#sign-up') setMode('signup');
      else if (window.location.hash === '#sign-in') setMode('signin');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleDemoLogin = () => {
    resetStore();
    login({
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@renocred.com',
      phone: '+91 98765 43210',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=1F5247&color=fff',
      salary: 2500000,
      creditScore: 810,
      userSegment: 'adult',
      primaryGoal: 'Maximise Cashback',
      onboardingCompleted: true,
    });
  };

  // Mirror whatever is typed into Clerk's first-name field onto the card preview
  useEffect(() => {
    if (!authPanelRef.current) return;

    const syncName = () => {
      const firstNameInput = authPanelRef.current?.querySelector<HTMLInputElement>(
        'input[name="firstName"], input[id*="firstName"], input[autocomplete="given-name"]'
      );
      if (firstNameInput) {
        setLivePreviewName(firstNameInput.value);
      }
    };

    // MutationObserver to detect when Clerk renders the input
    const observer = new MutationObserver(() => {
      const firstNameInput = authPanelRef.current?.querySelector<HTMLInputElement>(
        'input[name="firstName"], input[id*="firstName"], input[autocomplete="given-name"]'
      );
      if (firstNameInput) {
        firstNameInput.addEventListener('input', syncName);
        // Initial value
        syncName();
      }
    });

    observer.observe(authPanelRef.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      // Cleanup any lingering listeners by re-querying
      authPanelRef.current?.querySelectorAll<HTMLInputElement>(
        'input[name="firstName"], input[id*="firstName"], input[autocomplete="given-name"]'
      ).forEach(el => el.removeEventListener('input', syncName));
    };
  }, [mode]);

  const handleOnboardingSubmit = (skipOptional = false) => {
    const existingProfile = useDashboardStore.getState().profile;
    const profile: AppProfile = existingProfile ? {
      ...existingProfile,
      userSegment,
      primaryGoal,
      occupation: skipOptional ? undefined : occupation,
      city: skipOptional ? undefined : (city.trim() || undefined),
      onboardingCompleted: true,
    } : {
      id: user?.id || `usr_temp_${Date.now()}`,
      name: user?.fullName || user?.firstName || 'Your Name',
      email: user?.primaryEmailAddress?.emailAddress || '',
      phone: user?.primaryPhoneNumber?.phoneNumber || 'XXXXXXXXXX',
      avatar: user?.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=User&backgroundColor=f8f9fa`,
      salary,
      creditScore,
      userSegment,
      primaryGoal,
      occupation: skipOptional ? undefined : occupation,
      city: skipOptional ? undefined : (city.trim() || undefined),
      onboardingCompleted: true,
    };

    login(profile);
  };

  // During sign-up, show whatever is typed in real time; fall back to signed-in name or placeholder
  const displayName = isSignedIn
    ? (user?.fullName || user?.firstName || 'Your Name')
    : (livePreviewName.trim() || 'Your Name');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-mesh p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] max-w-5xl w-full gap-8 items-center">
        {/* Left Side: Branding & Premium Dashboard Teaser */}
        <div className="flex flex-col gap-6 text-left hidden lg:flex">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-ag-glow-primary overflow-hidden bg-black">
              <img src="/logo.jpg" alt="Renocred" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-ink-primary tracking-tight">
                renocred
              </p>
              <p className="text-[10px] font-semibold text-ink-tertiary tracking-[0.2em] uppercase">
                credit intelligence
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-4xl xl:text-5xl font-display font-extrabold text-ink-primary tracking-tight leading-tight">
              Unlock the power of your <span className="text-gradient-brand">financial profile</span>.
            </h1>
            <p className="text-sm text-ink-secondary mt-4 max-w-md leading-relaxed">
              renocred evaluates your credit score, compares 130+ cards, and acts as your personal optimizer to maximize your rewards and savings.
            </p>
          </div>

          {/* Interactive Card Preview */}
          <div
            className="relative mt-4 w-full max-w-sm rounded-2xl overflow-hidden group transition-all duration-500"
            style={{ perspective: '800px' }}
          >
            {/* Card face */}
            <div
              className="relative h-56 rounded-2xl p-6 flex flex-col justify-between transition-transform duration-500 group-hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(145deg, rgba(31,82,71,0.25) 0%, rgba(15,41,36,0.6) 40%, rgba(10,28,24,0.85) 100%)',
                transform: 'rotateX(2deg) rotateY(-1deg)',
                transformStyle: 'preserve-3d',
                boxShadow: `
                  0 1px 0 0 rgba(255,255,255,0.08) inset,
                  -1px 0 0 0 rgba(255,255,255,0.04) inset,
                  1px 0 0 0 rgba(0,0,0,0.2) inset,
                  0 -1px 0 0 rgba(0,0,0,0.3) inset,
                  0 4px 6px -1px rgba(0,0,0,0.3),
                  0 10px 20px -5px rgba(0,0,0,0.4),
                  0 25px 50px -12px rgba(0,0,0,0.5),
                  0 0 30px -5px rgba(31,82,71,0.15)
                `,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Top highlight edge */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              {/* Left highlight edge */}
              <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />

              {/* Ambient brand glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-400/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-xs text-brand-500 tracking-[0.2em] uppercase font-bold">renocred select</p>
                  <p className="text-[10px] text-ink-tertiary mt-1">Virtual Credentials</p>
                </div>
                <div className="w-10 h-7 bg-brand-500/10 rounded-md backdrop-blur-sm border border-brand-500/15 flex items-center justify-center">
                  <CreditCard size={16} className="text-brand-500" />
                </div>
              </div>

              <div className="relative z-10">
                {/* EMV Chip */}
                <div className="w-8 h-6 rounded-[3px] bg-gradient-to-br from-brand-300/30 to-brand-500/15 border border-brand-500/20 mb-3 grid grid-cols-2 grid-rows-2">
                  <div className="border-r border-b border-brand-500/15" />
                  <div className="border-b border-brand-500/15" />
                  <div className="border-r border-brand-500/15" />
                  <div />
                </div>

                <p className="text-xs text-ink-secondary font-mono tracking-[0.2em]">••••  ••••  ••••  4242</p>
                <div className="flex justify-between items-end mt-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-ink-disabled font-semibold">Cardholder</p>
                    <p className="text-sm font-bold text-ink-primary tracking-wide truncate max-w-[200px]">
                      {displayName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-ink-disabled font-semibold">Credit Score</p>
                    <p className="text-sm font-bold text-brand-500">{isSignedIn ? creditScore : '750'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card bottom edge / thickness shadow */}
            <div
              className="mx-2 h-2 rounded-b-xl"
              style={{
                background: 'linear-gradient(to bottom, rgba(10,28,24,0.7), rgba(0,0,0,0.3))',
                marginTop: '-2px',
                filter: 'blur(1px)',
              }}
            />
          </div>
        </div>

        {/* Right Side: Auth or Onboarding */}
        {isSignedIn ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="panel-glass rounded-[2rem] p-6 lg:p-8 w-full shadow-2xl relative overflow-hidden text-left flex flex-col gap-5"
          >
            {/* Step Indicator Header */}
            <div className="flex items-center justify-between border-b border-canvas-200/50 dark:border-white/[0.05] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-500">
                  Step {onboardingStep} of 3
                </span>
                <h2 className="text-lg lg:text-xl font-display font-bold text-ink-primary mt-0.5">
                  {onboardingStep === 1 && 'Financial Stage'}
                  {onboardingStep === 2 && 'Primary Goal'}
                  {onboardingStep === 3 && 'Optional Profile Details'}
                </h2>
              </div>
              <div className="flex gap-1.5">
                <div className={cn("w-5 h-1.5 rounded-full transition-all duration-300", onboardingStep >= 1 ? "bg-brand-500 shadow-ag-glow-primary" : "bg-canvas-300 dark:bg-white/10")} />
                <div className={cn("w-5 h-1.5 rounded-full transition-all duration-300", onboardingStep >= 2 ? "bg-brand-500 shadow-ag-glow-primary" : "bg-canvas-300 dark:bg-white/10")} />
                <div className={cn("w-5 h-1.5 rounded-full transition-all duration-300", onboardingStep >= 3 ? "bg-brand-500 shadow-ag-glow-primary" : "bg-canvas-300 dark:bg-white/10")} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {onboardingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4"
                >
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    What stage of your financial journey are you in?
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Youth Option */}
                    <button
                      type="button"
                      onClick={() => setUserSegment('youth')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex items-start gap-4 cursor-pointer",
                        userSegment === 'youth'
                          ? "bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/50 shadow-ag-glow-primary"
                          : "bg-canvas-50 dark:bg-canvas-200/40 border-canvas-300 dark:border-white/5 hover:border-brand-500/30"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        userSegment === 'youth' ? "bg-brand-500 text-white" : "bg-canvas-200 dark:bg-white/5 text-ink-tertiary"
                      )}>
                        <Sparkles size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-ink-primary">Youth</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                            18–22
                          </span>
                        </div>
                        <p className="text-xs text-ink-tertiary mt-1 leading-relaxed">
                          Build your financial foundation and discover smarter ways to experience more.
                        </p>
                      </div>
                    </button>

                    {/* Adult Option */}
                    <button
                      type="button"
                      onClick={() => setUserSegment('adult')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex items-start gap-4 cursor-pointer",
                        userSegment === 'adult'
                          ? "bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/50 shadow-ag-glow-primary"
                          : "bg-canvas-50 dark:bg-canvas-200/40 border-canvas-300 dark:border-white/5 hover:border-brand-500/30"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        userSegment === 'adult' ? "bg-brand-500 text-white" : "bg-canvas-200 dark:bg-white/5 text-ink-tertiary"
                      )}>
                        <ShieldCheck size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-ink-primary">Adult</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                            22+
                          </span>
                        </div>
                        <p className="text-xs text-ink-tertiary mt-1 leading-relaxed">
                          Optimize your spending, rewards and financial lifestyle.
                        </p>
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="mt-2 w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-ag-glow-primary active:scale-[0.98]"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4"
                >
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    What do you want RenoCred to help you with the most?
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {GOAL_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = primaryGoal === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPrimaryGoal(opt.id)}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer",
                            isSelected
                              ? "bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/50 shadow-ag-glow-primary"
                              : "bg-canvas-50 dark:bg-canvas-200/40 border-canvas-300 dark:border-white/5 hover:border-brand-500/30"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            isSelected ? "bg-brand-500 text-white" : "bg-canvas-200 dark:bg-white/5 text-ink-tertiary"
                          )}>
                            <IconComp size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-ink-primary">{opt.label}</h3>
                            <p className="text-[11px] text-ink-tertiary leading-tight mt-0.5 truncate">
                              {opt.description}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="px-4 py-3 rounded-xl border border-canvas-300 dark:border-white/10 text-xs font-bold text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04] transition-colors flex items-center gap-1.5"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(3)}
                      className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 shadow-ag-glow-primary active:scale-[0.98]"
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <p className="text-xs font-bold text-ink-primary">Optional Profile Details</p>
                    <p className="text-[11px] text-ink-tertiary mt-0.5">
                      Help us customize your recommendations further.
                    </p>
                  </div>

                  {/* Occupation Pills */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-ink-secondary flex items-center gap-1.5">
                      <Briefcase size={12} className="text-brand-500" /> Occupation (optional)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {OCCUPATION_OPTIONS.map((occ) => (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => setOccupation(occupation === occ ? undefined : occ)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                            occupation === occ
                              ? "bg-brand-500/10 border-brand-500 text-brand-500 ring-1 ring-brand-500/50 shadow-ag-glow-primary"
                              : "bg-canvas-50 dark:bg-canvas-200/40 border-canvas-300 dark:border-white/5 text-ink-tertiary hover:border-brand-500/30"
                          )}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-ink-secondary flex items-center gap-1.5">
                      <MapPin size={12} className="text-brand-500" /> City (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Bengaluru, Delhi..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-premium w-full text-xs py-2.5 px-3 bg-canvas-50 dark:bg-canvas-200"
                    />
                  </div>

                  <div className="flex gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="px-3.5 py-3 rounded-xl border border-canvas-300 dark:border-white/10 text-xs font-bold text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04] transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft size={15} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOnboardingSubmit(true)}
                      className="px-3.5 py-3 rounded-xl border border-canvas-300 dark:border-white/10 text-xs font-bold text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04] transition-colors whitespace-nowrap"
                    >
                      Skip for now
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOnboardingSubmit(false)}
                      className="flex-1 btn-primary py-3 flex items-center justify-center gap-1.5 shadow-ag-glow-primary active:scale-[0.98] text-xs font-bold"
                    >
                      Complete Setup <ChevronRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center flex justify-center gap-3 mt-2">
              <button onClick={() => setShowLegal('terms')} className="text-[10px] text-ink-disabled hover:text-ink-secondary">Terms of Service</button>
              <span className="text-ink-disabled text-[10px]">•</span>
              <button onClick={() => setShowLegal('privacy')} className="text-[10px] text-ink-disabled hover:text-ink-secondary">Privacy Policy</button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            ref={authPanelRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="panel-glass rounded-[2rem] p-6 lg:p-8 w-full shadow-2xl relative flex flex-col items-center"
          >
            {/* ── Header Row: Demo Button & Tab Switcher ── */}
            <div className="w-full flex justify-between items-center mb-6">
              <button
                onClick={handleDemoLogin}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 border border-brand-500/20 transition-colors flex items-center gap-2"
              >
                <CreditCard size={14} /> Try Demo
              </button>
              
              <div className="inline-flex p-1 rounded-xl bg-canvas-200/50 dark:bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
                <button
                  onClick={() => setMode('signin')}
                  className={cn(
                    'px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200',
                    mode === 'signin'
                      ? 'btn-primary shadow-ag-glow-primary'
                      : 'text-ink-tertiary hover:text-ink-secondary'
                  )}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={cn(
                    'px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200',
                    mode === 'signup'
                      ? 'btn-primary opacity-80'
                      : 'text-ink-tertiary hover:text-ink-secondary'
                  )}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* ── Clerk Auth Form ── */}
            <div className="w-full">
              {mode === 'signin' ? (
                <SignIn routing="virtual" />
              ) : (
                <SignUp routing="virtual" />
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Credit Blog Modal - Kept for aesthetics/future */}
      <AnimatePresence>
        {showBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlog(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-canvas-50 dark:bg-canvas-200 rounded-[2rem] p-6 shadow-ag-modal border border-canvas-200/60 dark:border-white/[0.04] overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              <div className="flex items-center justify-between mb-4 border-b border-canvas-200/50 dark:border-white/[0.04] pb-3">
                <h3 className="text-lg font-display font-bold text-ink-primary flex items-center gap-2">
                  <BookOpen className="text-brand-500" size={18} /> Credit Health Guide
                </h3>
                <button
                  onClick={() => setShowBlog(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-ink-secondary flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-ink-primary text-base">What is a CIBIL Credit Score?</h4>
                  <p className="mt-1">
                    Your CIBIL score is a 3-digit numeric summary of your credit history, rating your borrowing and repayment habits. It ranges from <strong>300 to 900</strong>.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-canvas-200/50 dark:border-white/[0.04] text-center">
                <button
                  onClick={() => setShowBlog(false)}
                  className="btn-primary active:scale-95"
                >
                  Got It, Thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Legal Modal */}
      <AnimatePresence>
        {showLegal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLegal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-canvas-50 dark:bg-canvas-200 rounded-[2rem] p-6 shadow-ag-modal border border-canvas-200/60 dark:border-white/[0.04] overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              <div className="flex items-center justify-between mb-4 border-b border-canvas-200/50 dark:border-white/[0.04] pb-3">
                <h3 className="text-lg font-display font-bold text-ink-primary flex items-center gap-2">
                  <BookOpen className="text-brand-500" size={18} /> {showLegal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button
                  onClick={() => setShowLegal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-canvas-200 dark:hover:bg-white/[0.04]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-ink-secondary flex flex-col gap-4">
                {showLegal === 'privacy' ? (
                  <div>
                    <h4 className="font-bold text-ink-primary text-base">Data Protection Commitment</h4>
                    <p className="mt-1">
                      At Renocred, we take your privacy seriously. Your financial information (such as salary and CIBIL score) is used exclusively to power the Wallet Optimizer and Taqdeer AI to provide you with the most accurate credit card recommendations.
                    </p>
                    <p className="mt-2">
                      We strictly <strong>do not sell, rent, or share</strong> your personal financial data with third-party advertisers or brokers. Your data is encrypted and stored securely.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-ink-primary text-base">Terms of Service</h4>
                    <p className="mt-1">
                      By using Renocred, you agree to our Terms of Service. The recommendations provided by Taqdeer AI and the Wallet Optimizer are for informational purposes only and do not constitute financial advice.
                    </p>
                    <p className="mt-2">
                      Approval for any credit card is strictly at the discretion of the issuing bank. Renocred is not responsible for any rejected applications or changes to bank reward structures.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-canvas-200/50 dark:border-white/[0.04] text-center">
                <button
                  onClick={() => setShowLegal(null)}
                  className="btn-primary active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
