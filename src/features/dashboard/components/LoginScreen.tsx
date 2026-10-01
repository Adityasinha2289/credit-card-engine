import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Sparkles } from 'lucide-react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { AppProfile, UserSegment, PrimaryGoal } from '../types/dashboard.types';
import { cn } from '../../../lib/utils';
import type { OnboardingState } from '../../onboarding/OnboardingFlow';
import { MASTER_CARD_DATASET } from '../../finix/data/masterDataset';
import { CARD_DATASET } from '../../finix/data/cardDataset';
import { CreditCard } from '../../cards/components/CreditCard';
import type { CardData, CardNetwork } from '../../cards/types/card.types';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow = lazy(() => import('../../onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));

const finixToCardData = (idMatch: string, nameMatch: string): CardData => {
  let finix = CARD_DATASET.find(c => c.id.toLowerCase().includes(idMatch.toLowerCase()));
  if (!finix) {
    finix = CARD_DATASET.find(c => c.name.toLowerCase().includes(nameMatch.toLowerCase())) || CARD_DATASET[0];
  }
  return {
    id: finix.id,
    pan: '•••• •••• •••• 1234',
    cardholderName: 'RENO CRED',
    expiry: '12/28',
    network: (finix.network.toLowerCase() || 'visa') as CardNetwork,
    bank: finix.bank,
    status: 'active',
    availableCredit: 500000,
    creditLimit: 500000,
    label: finix.name,
  };
};

export function LoginScreen({ defaultMode = 'signup' }: { defaultMode?: 'signin' | 'signup' }) {
  const { isSignedIn, user } = useUser();
  const login = useDashboardStore((s) => s.login);
  const [showBlog, setShowBlog] = useState(false);
  const [showLegal, setShowLegal] = useState<'privacy' | 'terms' | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const authPanelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#sign-up') setMode('signup');
      else if (window.location.hash === '#sign-in') setMode('signin');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOnboardingComplete = async (state: OnboardingState) => {
    const existingProfile = useDashboardStore.getState().profile;
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

  if (isSignedIn) {
    return (
      <Suspense fallback={<div className="min-h-[100dvh] w-full bg-editorial-light-cream" />}>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-editorial-light-cream p-4 lg:p-8 relative overflow-hidden text-editorial-deep-forest font-sans">
      
      {/* Editorial Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-editorial-soft-sage/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-editorial-soft-sage/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-[1100px] w-full gap-12 lg:gap-24 items-center relative z-10 mx-auto">
        
        {/* LEFT PANEL: Brand / Storytelling */}
        <div className="hidden lg:flex flex-col gap-12 pt-8">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
             <h1 className="text-4xl xl:text-5xl font-serif font-medium tracking-tight leading-[1.1] text-editorial-deep-forest mb-6">
               Your wallet,<br/>finally working intelligently.
             </h1>
             <p className="text-editorial-muted-sage text-lg max-w-md font-light leading-relaxed">
               Cards. Rewards. Offers.<br/>One place to make better money decisions.
             </p>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             transition={{ duration: 0.8, delay: 0.2 }}
             className="relative"
           >
              {/* Product Visual: Card Stack */}
              <div className="relative w-full max-w-[320px] h-[240px]">
                 {/* Card 2 (Background) */}
                 <motion.div 
                   initial={{ x: -20, y: 20, rotate: -4 }}
                   animate={{ x: -10, y: 10, rotate: -2 }}
                   transition={{ duration: 1, delay: 0.5 }}
                   className="absolute top-4 left-4 w-[280px] origin-center opacity-70 grayscale-[0.2]"
                 >
                    <CreditCard card={finixToCardData('sbi_cashback', 'Cashback')} variant="compact" />
                 </motion.div>

                 {/* Card 1 (Foreground) */}
                 <motion.div 
                   initial={{ x: 20, y: -20, rotate: 4 }}
                   animate={{ x: 0, y: 0, rotate: 0 }}
                   transition={{ duration: 1, delay: 0.4 }}
                   className="absolute top-0 left-0 w-[280px] origin-center drop-shadow-2xl z-10"
                 >
                    <CreditCard card={finixToCardData('hdfc_infinia', 'Infinia')} variant="compact" />
                 </motion.div>
                 
                 {/* Intelligence Label */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6, delay: 1 }}
                   className="absolute -right-8 bottom-4 bg-white/90 border border-editorial-soft-sage/20 rounded-xl p-4 shadow-xl z-20 backdrop-blur-md"
                 >
                    <div className="text-[10px] text-editorial-soft-sage font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                       <Sparkles className="w-3 h-3 text-editorial-forest" /> Potential Annual Value
                    </div>
                    <div className="text-xl font-mono text-editorial-deep-forest font-medium">₹1,250</div>
                 </motion.div>
              </div>
           </motion.div>
        </div>

        {/* RIGHT PANEL: Auth Surface */}
        <div className="w-full flex justify-center lg:justify-end py-4 lg:py-8">
          <motion.div
            ref={authPanelRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[440px] bg-white border border-editorial-soft-sage/20 rounded-[2rem] p-8 lg:p-10 shadow-[0_20px_50px_rgba(107,144,113,0.05)] relative flex flex-col"
          >
             {/* Header Row */}
             <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-editorial-deep-forest text-white overflow-hidden shadow-sm">
                    <img src="/logo.jpg" alt="RenoCred" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-lg font-serif font-medium text-editorial-deep-forest">renocred</span>
                </div>

                <div className="text-right pt-1 flex flex-col items-end gap-2">
                   {mode === 'signin' ? (
                      <button onClick={() => { setMode('signup'); navigate('/app/sign-up'); }} className="text-xs text-editorial-soft-sage hover:text-editorial-forest font-medium transition-colors">
                        New here? <span className="underline underline-offset-2">Get Started</span>
                      </button>
                   ) : (
                      <button onClick={() => { setMode('signin'); navigate('/app/sign-in'); }} className="text-xs text-editorial-soft-sage hover:text-editorial-forest font-medium transition-colors">
                        Already have an account? <span className="underline underline-offset-2">Log In</span>
                      </button>
                   )}
                   <button onClick={() => { window.location.href = '?demo=onboarding'; }} className="text-[10px] uppercase tracking-wider font-bold bg-[#2A9D5C]/10 text-[#2A9D5C] hover:bg-[#2A9D5C]/20 px-2 py-1 rounded-full transition-colors flex items-center gap-1">
                     <Sparkles size={10} /> Preview onboarding
                   </button>
                </div>
             </div>

             <div className="mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-serif font-medium text-editorial-deep-forest mb-2">
                       {mode === 'signin' ? "Welcome back." : "Start understanding your wallet."}
                    </h2>
                    <p className="text-sm text-editorial-muted-sage">
                       {mode === 'signin' ? "Your wallet intelligence is ready." : "See which cards, rewards, and offers actually fit your spending."}
                    </p>
                  </motion.div>
                </AnimatePresence>
             </div>

             {/* Clerk Container - Styled to match RenoCred Editorial theme */}
             <div className="w-full [&_.cl-rootBox]:w-full [&_.cl-card]:w-full [&_.cl-card]:shadow-none [&_.cl-card]:border-0 [&_.cl-card]:p-0 [&_.cl-card]:bg-transparent [&_.cl-header]:hidden [&_.cl-socialButtonsBlockButton]:border-editorial-soft-sage/30 [&_.cl-socialButtonsBlockButton]:text-editorial-deep-forest [&_.cl-socialButtonsBlockButton]:hover:bg-editorial-soft-sage/5 [&_.cl-socialButtonsBlockButton]:rounded-xl [&_.cl-socialButtonsBlockButton]:h-11 [&_.cl-dividerLine]:bg-editorial-soft-sage/20 [&_.cl-dividerText]:text-editorial-muted-sage [&_.cl-formFieldLabel]:text-editorial-deep-forest [&_.cl-formFieldLabel]:font-medium [&_.cl-formFieldInput]:border-editorial-soft-sage/30 [&_.cl-formFieldInput]:bg-editorial-light-cream/50 [&_.cl-formFieldInput]:rounded-xl [&_.cl-formFieldInput]:h-11 [&_.cl-formFieldInput]:text-editorial-deep-forest focus:[&_.cl-formFieldInput]:ring-1 focus:[&_.cl-formFieldInput]:ring-editorial-forest focus:[&_.cl-formFieldInput]:border-editorial-forest [&_.cl-formButtonPrimary]:bg-editorial-deep-forest [&_.cl-formButtonPrimary]:hover:bg-editorial-forest [&_.cl-formButtonPrimary]:rounded-xl [&_.cl-formButtonPrimary]:h-11 [&_.cl-formButtonPrimary]:font-medium [&_.cl-formButtonPrimary]:transition-colors [&_.cl-footer]:hidden [&_.cl-identityPreview]:bg-editorial-light-cream/50 [&_.cl-identityPreview]:border-editorial-soft-sage/30 [&_.cl-identityPreview]:rounded-xl [&_.cl-identityPreviewText]:text-editorial-deep-forest [&_.cl-identityPreviewEditButton]:text-editorial-forest [&_.cl-formFieldSuccessIcon]:text-editorial-forest [&_.cl-internal-2q60ed]:text-editorial-forest">
                {mode === 'signin' ? (
                  <SignIn routing="path" path="/app/sign-in" signUpUrl="/app/sign-up" forceRedirectUrl="/app" fallbackRedirectUrl="/app" />
                ) : (
                  <SignUp routing="path" path="/app/sign-up" signInUrl="/app/sign-in" forceRedirectUrl="/app" fallbackRedirectUrl="/app" />
                )}
             </div>

          </motion.div>
        </div>
      </div>

      {/* Legal Modal logic maintained just in case */}
      <AnimatePresence>
        {showLegal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLegal(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] p-6 shadow-2xl border border-editorial-soft-sage/20 overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              <div className="flex items-center justify-between mb-4 border-b border-editorial-soft-sage/20 pb-3">
                <h3 className="text-lg font-serif font-medium text-editorial-deep-forest flex items-center gap-2">
                  <BookOpen className="text-editorial-forest" size={18} /> {showLegal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button
                  onClick={() => setShowLegal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-editorial-muted-sage hover:text-editorial-deep-forest hover:bg-editorial-light-cream"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-editorial-muted-sage flex flex-col gap-4">
                {showLegal === 'privacy' ? (
                  <div>
                    <h4 className="font-bold text-editorial-deep-forest text-base">Data Protection Commitment</h4>
                    <p className="mt-1">
                      At Renocred, we take your privacy seriously. Your financial information is used exclusively to power the Wallet Optimizer.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-editorial-deep-forest text-base">Terms of Service</h4>
                    <p className="mt-1">
                      By using Renocred, you agree to our Terms of Service. Recommendations are for informational purposes only.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-editorial-soft-sage/20 text-center">
                <button
                  onClick={() => setShowLegal(null)}
                  className="px-6 py-2 rounded-xl bg-editorial-deep-forest text-white hover:bg-editorial-forest transition-colors font-medium text-sm inline-block"
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
