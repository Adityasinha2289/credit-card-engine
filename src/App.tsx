import { analytics } from './lib/analytics';
import './index.css';
import { useState, useEffect, Suspense, lazy } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardSkeleton } from './components/layout/DashboardSkeleton';
import { useDashboardStore, useHydration } from './features/dashboard/store/dashboardStore';
import { useSupabase } from './hooks/useSupabase';

// Finix features (Lazy Loaded)
import { LoginScreen } from './features/dashboard/components/LoginScreen';

const HomePage = lazy(() => import('./pages/app/HomePage'));
const WalletPage = lazy(() => import('./pages/app/WalletPage'));
const ExplorePage = lazy(() => import('./pages/app/ExplorePage'));
const InsightsPage = lazy(() => import('./pages/app/InsightsPage'));
const TaqdeerPage = lazy(() => import('./pages/app/TaqdeerPage'));
const ProfilePage = lazy(() => import('./pages/app/ProfilePage'));

// Lifestyle (Phase 5A Prototype)
const LifestyleHub = lazy(() => import('./pages/app/lifestyle/LifestyleHub'));
const PlanDatePage = lazy(() => import('./pages/app/lifestyle/PlanDatePage'));
const InvestPage = lazy(() => import('./pages/app/lifestyle/InvestPage'));
const ShopPage = lazy(() => import('./pages/app/lifestyle/ShopPage'));
const PartnerDetailPage = lazy(() => import('./pages/app/lifestyle/PartnerDetailPage'));

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const supabase = useSupabase();
  const [hasAttemptedHydration, setHasAttemptedHydration] = useState(false);
  const profile = useDashboardStore((s) => s.profile);
  const resetStore = useDashboardStore((s) => s._reset);
  const isHydrated = useHydration();
  const hydrateFromSupabase = useDashboardStore((s) => s.hydrateFromSupabase);
  const [isHydratingFromSupabase, setIsHydratingFromSupabase] = useState(false);

  // Authentication & Hydration flow
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    let isMounted = true;
    
    async function initUser() {
      if (!isMounted) return;
      
      const clerkId = user?.id;
      if (!clerkId) return;

      try {
        if (!isHydrated && !hasAttemptedHydration) {
          setIsHydratingFromSupabase(true);
          await hydrateFromSupabase(clerkId, supabase);
          setHasAttemptedHydration(true);
        }
      } catch (error) {
        console.error("Hydration error:", error);
      } finally {
        if (isMounted) {
          setIsHydratingFromSupabase(false);
        }
      }
    }
    
    initUser();
    
    return () => {
      isMounted = false;
    };
  }, [isLoaded, user, isHydrated, hydrateFromSupabase, supabase, hasAttemptedHydration]);

  // Logout listener
  useEffect(() => {
    const handleLogout = () => {
      setHasAttemptedHydration(false);
    };
    window.addEventListener('STORE_LOGOUT', handleLogout);
    return () => window.removeEventListener('STORE_LOGOUT', handleLogout);
  }, []);

  const isTestKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.includes('test');
  
  if (!isHydrated || (!isLoaded && !isTestKey) || isHydratingFromSupabase) {
    return (
      <DashboardLayout
        isDark={true}
        onToggleTheme={() => {}}
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // 1. If not signed in AND not using the demo, show LoginScreen (Clerk Auth View)
  const isDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true';
  if (!isSignedIn && !isDemo) {
    return <LoginScreen />;
  }

  // 2. If signed in, but profile or onboarding is incomplete, show LoginScreen (Questionnaire View)
  if (isSignedIn && (!profile || !profile.onboardingCompleted)) {
    return <LoginScreen />;
  }

  return (
    <DashboardLayout
      isDark={true}
      onToggleTheme={() => {}}
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/taqdeer" element={<TaqdeerPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="/lifestyle" element={<LifestyleHub />} />
          <Route path="/lifestyle/plan" element={<LifestyleHub />} />
          <Route path="/lifestyle/plan/date" element={<PlanDatePage />} />
          <Route path="/lifestyle/invest" element={<InvestPage />} />
          <Route path="/lifestyle/shop" element={<ShopPage />} />
          <Route path="/lifestyle/partner/:id" element={<PartnerDetailPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  );
}
