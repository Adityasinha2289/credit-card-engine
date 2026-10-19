import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { SignIn, SignUp, GoogleOneTap, useUser } from '@clerk/clerk-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { AppProfile, UserSegment, PrimaryGoal } from '../types/dashboard.types';
import type { OnboardingState } from '../../onboarding/OnboardingFlow';
import { Link, useNavigate } from 'react-router-dom';
import { CardFace } from '../../../public-platform/site/CardFace';
import { LoaderHold } from '../../../components/BrandLoader';

const OnboardingFlow = lazy(() => import('../../onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));

export function LoginScreen({ defaultMode = 'signup' }: { defaultMode?: 'signin' | 'signup' }) {
  const { isSignedIn, user } = useUser();
  const login = useDashboardStore((s) => s.login);
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
      // Unknown until the user chooses to tell us — never invent an income or score.
      salary: state.salary || 0,
      creditScore: state.creditScore || 0,
      userSegment: calculatedSegment,
      primaryGoal: (state.goal as PrimaryGoal) || 'Maximise Cashback',
      spendCategories: state.priorities,
      onboardingCompleted: true,
    };

    // Wait for the profile row: the cards below reference it, and on a fresh
    // sign-up the Clerk webhook that also creates it may not have run yet.
    await login(profile);

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
      // Loaded on demand: the onboarding chunk already has it, the sign-in page doesn't need it.
      const { MASTER_CARD_DATASET } = await import('../../finix/data/masterDataset');
      await Promise.all(state.banks.map(cardId => {
        const fullCard = MASTER_CARD_DATASET.find(c => c.id === cardId);
        if (fullCard) {
          return store.addUserCard({
            id: fullCard.id,
            // Picked from the catalogue: we know the product, not the user's number,
            // expiry or limit, so those stay empty until the user adds them.
            pan: '',
            cardholderName: profile.name,
            expiry: '',
            network: fullCard.network.toLowerCase() as any,
            bank: fullCard.bank,
            status: 'active',
            availableCredit: 0,
            creditLimit: 0,
            label: fullCard.name,
            gradientFrom: fullCard.gradientFrom || '#1e3c72',
            gradientTo: fullCard.gradientTo || '#2a5298',
          });
        }
        return Promise.resolve();
      }));
    }
  };

  if (isSignedIn) {
    return (
      <Suspense fallback={<LoaderHold />}>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  const switchMode = () => {
    const next = mode === 'signin' ? 'signup' : 'signin';
    setMode(next);
    navigate(next === 'signin' ? '/app/sign-in' : '/app/sign-up');
  };

  return (
    <div className="grid min-h-[100dvh] w-full bg-rc-cream font-sans text-rc-ink lg:grid-cols-2">
      {/* LEFT: brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-rc-ink text-rc-cream lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-16">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.jpg" alt="" width={32} height={32} className="h-8 w-8 rounded-[9px] object-cover ring-1 ring-white/10" />
          <span className="text-[17px] font-semibold tracking-[-0.01em]">RenoCred</span>
        </Link>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[13ch] font-serif text-[clamp(2.75rem,4.4vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.025em]"
          >
            Every card you own, <span className="italic text-rc-pistachio">working together.</span>
          </motion.h1>

          <div className="relative mt-16 h-[230px] w-[420px] max-w-full">
            <motion.div initial={{ opacity: 0, rotate: 0 }} animate={{ opacity: 0.55, rotate: 8 }} transition={{ duration: 1, delay: 0.2 }} className="absolute left-16 top-0">
              <CardFace name="Cashback SBI Card" bank="SBI" width={260} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35 }} className="absolute left-0 top-8">
              <CardFace name="Swiggy HDFC" bank="HDFC" width={280} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="absolute bottom-0 right-0 w-[230px] rounded-2xl bg-rc-paper p-4 text-rc-ink shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)]"
            >
              <p className="flex justify-between text-[12px] text-rc-muted"><span>Dinner for two</span><span className="tabular-nums">₹2,400</span></p>
              <p className="mt-2 flex items-end justify-between">
                <span className="font-serif text-[18px] leading-tight">Swiggy HDFC</span>
                <span className="font-serif text-[20px] leading-none text-rc-emerald tabular-nums">+₹240</span>
              </p>
            </motion.div>
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-rc-mist">
          {['Free to use', 'Never touches your credit score', 'No full card numbers'].map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-rc-pistachio" />{t}</li>
          ))}
        </ul>
      </aside>

      {/* RIGHT: auth */}
      <main className="flex min-h-[100dvh] flex-col px-5 py-6 sm:px-10 lg:px-14 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-[14px] text-rc-muted transition-colors hover:text-rc-ink">
            <ArrowLeft className="h-4 w-4" /> <span className="lg:hidden">RenoCred</span><span className="hidden lg:inline">Back to site</span>
          </Link>
          <button type="button" onClick={switchMode} className="text-right text-[14px] text-rc-muted transition-colors hover:text-rc-ink">
            {mode === 'signin'
              ? <>New here? <span className="font-medium text-rc-ink underline decoration-rc-ink/25 underline-offset-4">Create an account</span></>
              : <>Have an account? <span className="font-medium text-rc-ink underline decoration-rc-ink/25 underline-offset-4">Log in</span></>}
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <h2 className="font-serif text-[clamp(2.25rem,4vw,3rem)] font-medium leading-[1.02] tracking-[-0.02em]">
                {mode === 'signin' ? 'Welcome back.' : 'Make every swipe count.'}
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-rc-muted">
                {mode === 'signin' ? 'Pick up where you left off.' : 'Free, and about a minute to set up. Add your cards and see what each one is for.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* One-tap Google sign-in/up: a single click for returning Google users.
              Requires Google enabled in the Clerk dashboard (opt-in via env). */}
          {import.meta.env.VITE_GOOGLE_ONE_TAP === 'true' && (
            <GoogleOneTap signInForceRedirectUrl="/app" signUpForceRedirectUrl="/app" cancelOnTapOutside={false} />
          )}

          <div ref={authPanelRef} className="mt-9 w-full">
            {mode === 'signin' ? (
              <SignIn routing="path" path="/app/sign-in" signUpUrl="/app/sign-up" forceRedirectUrl="/app" fallbackRedirectUrl="/app" />
            ) : (
              <SignUp routing="path" path="/app/sign-up" signInUrl="/app/sign-in" forceRedirectUrl="/app" fallbackRedirectUrl="/app" />
            )}
          </div>

          <p className="mt-8 text-[12px] leading-relaxed text-rc-muted">
            By continuing you agree to our <Link to="/terms" className="underline underline-offset-2 hover:text-rc-ink">Terms</Link> and <Link to="/privacy" className="underline underline-offset-2 hover:text-rc-ink">Privacy policy</Link>.
          </p>
        </div>

      </main>
    </div>
  );
}
