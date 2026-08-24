import { analytics } from './lib/analytics';
import './index.css';
import { useState, useEffect, Suspense, lazy } from 'react';
import { useUser, RedirectToSignIn, RedirectToSignUp } from '@clerk/clerk-react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardSkeleton } from './components/layout/DashboardSkeleton';
import { useDashboardStore, useHydration } from './features/dashboard/store/dashboardStore';
import { useSupabase } from './hooks/useSupabase';

// Finix features (Lazy Loaded)
import { LoginScreen } from './features/dashboard/components/LoginScreen';

// Admin imports
import { AdminGuard } from './components/auth/AdminGuard';
import { AdminLayout } from './components/layout/AdminLayout';

const HomePage = lazy(() => import('./pages/app/HomePage'));
const WalletPage = lazy(() => import('./pages/app/WalletPage'));
const CreditPage = lazy(() => import('./pages/app/CreditPage'));
const ExplorePage = lazy(() => import('./pages/app/ExplorePage'));
const InsightsPage = lazy(() => import('./pages/app/InsightsPage'));
const TaqdeerPage = lazy(() => import('./pages/app/TaqdeerPage'));
const ProfilePage = lazy(() => import('./pages/app/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/app/SettingsPage'));

// Marketplace
const MarketplaceHome = lazy(() => import('./pages/marketplace/MarketplaceHome'));
const CategoryPage = lazy(() => import('./pages/marketplace/CategoryPage'));
const SubcategoryPage = lazy(() => import('./pages/marketplace/SubcategoryPage'));

// Lifestyle (Phase 5A Prototype) - Redirecting to marketplace
const LifestyleHub = lazy(() => import('./pages/app/lifestyle/LifestyleHub'));
const PlanDatePage = lazy(() => import('./pages/app/lifestyle/PlanDatePage'));
const InvestPage = lazy(() => import('./pages/app/lifestyle/InvestPage'));
const ShopPage = lazy(() => import('./pages/app/lifestyle/ShopPage'));
const PartnerDetailPage = lazy(() => import('./pages/app/lifestyle/PartnerDetailPage'));

// Admin (Phase 6.1)
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const PartnerManagement = lazy(() => import('./pages/admin/PartnerManagement'));
const PartnerForm = lazy(() => import('./pages/admin/PartnerForm'));
const EntityManagement = lazy(() => import('./pages/admin/EntityManagement'));
const EntityForm = lazy(() => import('./pages/admin/EntityForm'));
const OfferManagement = lazy(() => import('./pages/admin/OfferManagement'));
const OfferForm = lazy(() => import('./pages/admin/OfferForm'));
const AffiliateManagement = lazy(() => import('./pages/admin/AffiliateManagement'));

import { useQueryClient } from '@tanstack/react-query';

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [hasAttemptedHydration, setHasAttemptedHydration] = useState(false);
  const profile = useDashboardStore((s) => s.profile);
  const _reset = useDashboardStore((s) => s._reset);
  const setSupabaseClient = useDashboardStore((s) => s.setSupabaseClient);
  const isHydrated = useHydration();
  const hydrateFromSupabase = useDashboardStore((s) => s.hydrateFromSupabase);
  const [isHydratingFromSupabase, setIsHydratingFromSupabase] = useState(false);

  // Sync Supabase Client instance to store for actions
  useEffect(() => {
    if (supabase) {
      setSupabaseClient(supabase as any);
    }
  }, [supabase, setSupabaseClient]);

  // Security: Reset store & clear query cache if user signs out or account changes
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        _reset();
        queryClient.clear();
        setHasAttemptedHydration(false);
      } else if (profile && profile.id !== user.id) {
        _reset();
        queryClient.clear();
        setHasAttemptedHydration(false);
      }
    }
  }, [isLoaded, user, profile?.id, _reset, queryClient]);

  // Authentication & Hydration flow
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    let isMounted = true;
    
    async function initUser() {
      if (!isMounted) return;
      
      const clerkId = user?.id;
      if (!clerkId) return;

      try {
        if ((!isHydrated || !profile) && !hasAttemptedHydration) {
          setIsHydratingFromSupabase(true);
          const email = user.primaryEmailAddress?.emailAddress || '';
          const name = user.fullName || user.firstName || 'Your Name';
          const avatar = user.imageUrl || '';
          
          await hydrateFromSupabase(clerkId, email, name, avatar, user.unsafeMetadata);
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
    return (
      <Routes>
        <Route path="/sign-in/*" element={<LoginScreen defaultMode="signin" />} />
        <Route path="/sign-up/*" element={<LoginScreen defaultMode="signup" />} />
        <Route path="*" element={<Navigate to="/app/sign-up" replace />} />
      </Routes>
    );
  }

  // 2. If signed in, but profile or onboarding is incomplete, show LoginScreen (Questionnaire View)
  const clerkMetadata = user?.unsafeMetadata as any;
  const isCompletedInClerk = clerkMetadata?.onboardingCompleted === true;

  if (isSignedIn && (!profile || (!profile.onboardingCompleted && !isCompletedInClerk))) {
    return (
      <Routes>
        <Route path="*" element={<LoginScreen defaultMode="signup" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Customer App Routes */}
      <Route element={
        <DashboardLayout isDark={true} onToggleTheme={() => {}}>
          <Suspense fallback={
            <div className="p-6 md:p-12 w-full max-w-7xl mx-auto">
              <DashboardSkeleton />
            </div>
          }>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      }>
        <Route path="/" element={<HomePage />} />
        <Route path="/credit/*" element={<CreditPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/taqdeer" element={<TaqdeerPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Marketplace Routes in Dashboard */}
        <Route path="marketplace" element={<MarketplaceHome />} />
        <Route path="marketplace/:categorySlug" element={<CategoryPage />} />
        <Route path="marketplace/:categorySlug/:subcategorySlug" element={<SubcategoryPage />} />
        
        {/* Legacy Lifestyle Routes - redirecting to marketplace */}
        <Route path="lifestyle" element={<Navigate to="/app/marketplace" replace />} />
        <Route path="lifestyle/*" element={<Navigate to="/app/marketplace" replace />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminGuard>
          <AdminLayout>
            <Suspense fallback={<div className="p-6">Loading admin...</div>}>
              <Outlet />
            </Suspense>
          </AdminLayout>
        </AdminGuard>
      }>
        <Route index element={<AdminOverview />} />
        <Route path="partners" element={<PartnerManagement />} />
        <Route path="partners/:id" element={<PartnerForm />} />
        <Route path="entities" element={<EntityManagement />} />
        <Route path="entities/:id" element={<EntityForm />} />
        <Route path="offers" element={<OfferManagement />} />
        <Route path="offers/:id" element={<OfferForm />} />
        <Route path="affiliate" element={<AffiliateManagement />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
