import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SignIn, SignUp, GoogleOneTap, useUser } from '@clerk/clerk-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { AppProfile, UserSegment, PrimaryGoal } from '../types/dashboard.types';
import type { OnboardingState } from '../../onboarding/OnboardingFlow';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RETURN_PARAM, authPathFor, safeReturnPath } from '../lib/returnPath';
import { AuthAside } from './AuthAside';
import { LoaderHold } from '../../../components/BrandLoader';

const OnboardingFlow = lazy(() => import('../../onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));

export function LoginScreen({ defaultMode = 'signup' }: { defaultMode?: 'signin' | 'signup' }) {
  const { isSignedIn, user } = useUser();
  const login = useDashboardStore((s) => s.login);
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const authPanelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // the page someone asked for before signing in (only app paths are honoured)
  const [params] = useSearchParams();
  const returnTo = safeReturnPath(params.get(RETURN_PARAM)) ?? '/app';

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
    navigate(authPathFor(next, returnTo));
  };

  return (
    <div className="grid min-h-[100dvh] w-full bg-rc-cream font-sans text-rc-ink lg:grid-cols-2">
      {/* LEFT: brand panel (desktop) */}
      <AuthAside />

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
              <SignIn routing="path" path="/app/sign-in" signUpUrl={authPathFor('signup', returnTo)} forceRedirectUrl={returnTo} fallbackRedirectUrl={returnTo} />
            ) : (
              <SignUp routing="path" path="/app/sign-up" signInUrl={authPathFor('signin', returnTo)} forceRedirectUrl={returnTo} fallbackRedirectUrl={returnTo} />
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
