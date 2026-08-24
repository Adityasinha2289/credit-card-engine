import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
import type { OnboardingState } from '../../onboarding/OnboardingFlow';
import { lazy, Suspense } from 'react';
import { MASTER_CARD_DATASET } from '../../finix/data/masterDataset';

const OnboardingFlow = lazy(() => import('../../onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));

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

  const salary = 1500000;
  const creditScore = 750;

  // Premium 10/10 3D Hover Effect State
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ["17deg", "-17deg"]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-17deg", "17deg"]), springConfig);
  
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], ["100%", "0%"]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], ["100%", "0%"]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    mouseX.set(mouseXPos / width - 0.5);
    mouseY.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

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

  const handleOnboardingComplete = async (state: OnboardingState) => {
    const existingProfile = useDashboardStore.getState().profile;
    
    // Convert 18-22 to youth segment, else adult
    const calculatedSegment: UserSegment = state.age === '18–22' ? 'youth' : 'adult';
    
    const profile: AppProfile = existingProfile ? {
      ...existingProfile,
      userSegment: calculatedSegment,
      primaryGoal: (state.goal as PrimaryGoal) || 'Maximise Cashback',
      spendCategories: state.priorities || existingProfile.spendCategories,
      onboardingCompleted: true,
    } : {
      id: user?.id || `usr_temp_${Date.now()}`,
      name: user?.fullName || user?.firstName || 'Your Name',
      email: user?.primaryEmailAddress?.emailAddress || '',
      phone: user?.primaryPhoneNumber?.phoneNumber || 'XXXXXXXXXX',
      avatar: user?.imageUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=User&backgroundColor=f8f9fa`,
      salary: state.salary || 1500000,
      creditScore: state.creditScore || 750,
      userSegment: calculatedSegment,
      primaryGoal: (state.goal as PrimaryGoal) || 'Maximise Cashback',
      spendCategories: state.priorities,
      onboardingCompleted: true,
    };

    login(profile);
    
    if (user) {
      user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingCompleted: true,
          profileData: profile
        }
      }).catch(console.error);
    }
    
    // Process selected credit cards
    if (state.banks && state.banks.length > 0) {
      const store = useDashboardStore.getState();
      state.banks.forEach(cardId => {
        const fullCard = MASTER_CARD_DATASET.find(c => c.id === cardId);
        if (fullCard) {
          store.addUserCard({
            id: fullCard.id,
            pan: fullCard.first4Digits + ' **** **** ' + Math.floor(1000 + Math.random() * 9000),
            cardholderName: profile.name,
            expiry: '12/28',
            network: fullCard.network.toLowerCase() as any,
            bank: fullCard.bank,
            status: 'active',
            availableCredit: fullCard.minIncome ? Math.floor(fullCard.minIncome / 12) : 50000,
            creditLimit: fullCard.minIncome ? Math.floor(fullCard.minIncome / 12) : 50000,
            label: fullCard.name,
            gradientFrom: fullCard.gradientFrom || '#1e3c72',
            gradientTo: fullCard.gradientTo || '#2a5298',
          });
        }
      });
    }
  };

  // During sign-up, show whatever is typed in real time; fall back to signed-in name or placeholder
  const displayName = isSignedIn
    ? (user?.fullName || user?.firstName || 'Your Name')
    : (livePreviewName.trim() || 'Your Name');

  if (isSignedIn) {
    return (
      <Suspense fallback={<div className="min-h-[100dvh] w-full bg-surface-primary" />}>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FAFBF9] p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] max-w-5xl w-full gap-8 items-center">
        {/* Left Side: Branding & Premium Dashboard Teaser */}
        <div className="flex flex-col gap-6 text-left">
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(4,59,39,0.1)] overflow-hidden bg-white border border-gray-300">
              <img src="/logo.jpg" alt="Renocred" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-gray-900 tracking-tight">
                renocred
              </p>
              <p className="text-[10px] font-semibold text-gray-600 tracking-[0.2em] uppercase">
                credit intelligence
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-4xl xl:text-5xl font-display font-extrabold text-gray-900 tracking-tight leading-tight">
              Unlock the power of your <span className="bg-gradient-to-r from-[#2A9D5C] via-[#2A9D5C] to-emerald-400 text-transparent bg-clip-text">financial profile</span>.
            </h1>
            <p className="hidden lg:block text-sm text-gray-600 mt-4 max-w-md leading-relaxed">
              renocred evaluates your credit score, compares 130+ cards, and acts as your personal optimizer to maximize your rewards and savings.
            </p>
          </div>

          {/* Interactive Card Preview */}
          <div className="hidden lg:block relative mt-4 w-full max-w-sm" style={{ perspective: '1200px' }}>
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
              style={{
                rotateX,
                rotateY,
                scale: isHovered ? 1.05 : 1,
                transformStyle: 'preserve-3d',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative h-56 rounded-2xl p-6 flex flex-col justify-between cursor-pointer w-full group"
            >
              {/* Main Card Background */}
              <div 
                className="absolute inset-0 rounded-2xl overflow-hidden transition-shadow duration-500"
                style={{
                  background: 'linear-gradient(145deg, rgba(31,82,71,0.25) 0%, rgba(15,41,36,0.6) 40%, rgba(10,28,24,0.85) 100%)',
                  boxShadow: isHovered 
                    ? `0 30px 60px -12px rgba(42,157,92,0.5), 0 1px 0 0 rgba(255,255,255,0.12) inset, -1px 0 0 0 rgba(255,255,255,0.06) inset, 1px 0 0 0 rgba(0,0,0,0.2) inset, 0 -1px 0 0 rgba(0,0,0,0.3) inset`
                    : `0 10px 30px -5px rgba(0,0,0,0.5), 0 1px 0 0 rgba(255,255,255,0.08) inset, -1px 0 0 0 rgba(255,255,255,0.04) inset, 1px 0 0 0 rgba(0,0,0,0.2) inset, 0 -1px 0 0 rgba(0,0,0,0.3) inset`,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Dynamic Glare */}
                <motion.div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
                  style={{
                    background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 50%)",
                    left: glareX,
                    top: glareY,
                    width: '200%',
                    height: '200%',
                    x: '-50%',
                    y: '-50%',
                  }}
                />
              </div>

              {/* Ambient brand glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-emerald-glow rounded-full blur-[80px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700 mix-blend-screen" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-emerald-muted rounded-full blur-[60px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700 mix-blend-screen" />

              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-xs text-brand-emerald tracking-[0.2em] uppercase font-bold">renocred select</p>
                  <p className="text-[10px] text-text-muted mt-1">Virtual Credentials</p>
                </div>
                <div className="w-10 h-7 bg-brand-emerald-muted rounded-md backdrop-blur-sm border border-brand-emerald/15 flex items-center justify-center">
                  <CreditCard size={16} className="text-brand-emerald" />
                </div>
              </div>

              <div className="relative z-10">
                {/* EMV Chip */}
                <div className="w-8 h-6 rounded-[3px] bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/15 border border-[#d4af37]/20 mb-3 grid grid-cols-2 grid-rows-2">
                  <div className="border-r border-b border-[#d4af37]/15" />
                  <div className="border-b border-[#d4af37]/15" />
                  <div className="border-r border-[#d4af37]/15" />
                  <div />
                </div>

                <p className="text-xs text-text-secondary font-mono tracking-[0.2em]">••••  ••••  ••••  4242</p>
                <div className="flex justify-between items-end mt-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Cardholder</p>
                    <p className="text-sm font-bold text-text-primary tracking-wide truncate max-w-[200px]">
                      {displayName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-text-muted font-semibold">Credit Score</p>
                    <p className="text-sm font-bold text-brand-emerald">{isSignedIn ? creditScore : '750'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Auth */}
        <motion.div
            ref={authPanelRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-[#151515] border border-gray-700 rounded-[2rem] p-6 lg:p-8 w-full shadow-2xl relative flex flex-col items-center"
          >
            {/* ── Header Row: Demo Button & Tab Switcher ── */}
            <div className="w-full flex justify-between items-center mb-6">
            <div className="w-full flex justify-end items-center mb-6">
                <button
                  onClick={() => setMode('signin')}
                  className={cn(
                    'px-6 py-2 rounded-full text-sm font-bold transition-all duration-200',
                    mode === 'signin'
                      ? 'bg-[#2A9D5C] text-gray-900 shadow-lg border border-[#2A9D5C]/50'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={cn(
                    'px-6 py-2 rounded-full text-sm font-bold transition-all duration-200',
                    mode === 'signup'
                      ? 'bg-[#2A9D5C] text-gray-900 shadow-lg border border-[#2A9D5C]/50'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* ── Clerk Auth Form ── */}
            <div className="w-full">
              {mode === 'signin' ? (
                <SignIn routing="virtual" fallbackRedirectUrl="/app" forceRedirectUrl="/app" />
              ) : (
                <SignUp routing="virtual" fallbackRedirectUrl="/app" forceRedirectUrl="/app" />
              )}
            </div>
        </motion.div>
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
              className="relative w-full max-w-lg bg-surface-secondary rounded-[2rem] p-6 shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
                <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                  <BookOpen className="text-brand-emerald" size={18} /> Credit Health Guide
                </h3>
                <button
                  onClick={() => setShowBlog(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-text-secondary flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-text-primary text-base">What is a CIBIL Credit Score?</h4>
                  <p className="mt-1">
                    Your CIBIL score is a 3-digit numeric summary of your credit history, rating your borrowing and repayment habits. It ranges from <strong>300 to 900</strong>.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border-subtle text-center">
                <button
                  onClick={() => setShowBlog(false)}
                  className="px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(4,59,39,0.3)] bg-brand-emerald text-gray-900 font-bold border border-[#054a31] bg-gradient-to-b from-[#064d34] to-[#043b27] hover:brightness-110 active:scale-[0.98] transition-all inline-block"
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
              className="relative w-full max-w-lg bg-surface-secondary rounded-[2rem] p-6 shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
                <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                  <BookOpen className="text-brand-emerald" size={18} /> {showLegal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button
                  onClick={() => setShowLegal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-secondary dark:hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-text-secondary flex flex-col gap-4">
                {showLegal === 'privacy' ? (
                  <div>
                    <h4 className="font-bold text-text-primary text-base">Data Protection Commitment</h4>
                    <p className="mt-1">
                      At Renocred, we take your privacy seriously. Your financial information (such as salary and CIBIL score) is used exclusively to power the Wallet Optimizer and Taqdeer AI to provide you with the most accurate credit card recommendations.
                    </p>
                    <p className="mt-2">
                      We strictly <strong>do not sell, rent, or share</strong> your personal financial data with third-party advertisers or brokers. Your data is encrypted and stored securely.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-text-primary text-base">Terms of Service</h4>
                    <p className="mt-1">
                      By using Renocred, you agree to our Terms of Service. The recommendations provided by Taqdeer AI and the Wallet Optimizer are for informational purposes only and do not constitute financial advice.
                    </p>
                    <p className="mt-2">
                      Approval for any credit card is strictly at the discretion of the issuing bank. Renocred is not responsible for any rejected applications or changes to bank reward structures.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-border-subtle text-center">
                <button
                  onClick={() => setShowLegal(null)}
                  className="px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(4,59,39,0.3)] bg-brand-emerald text-gray-900 font-bold border border-[#054a31] bg-gradient-to-b from-[#064d34] to-[#043b27] hover:brightness-110 active:scale-[0.98] transition-all inline-block"
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
