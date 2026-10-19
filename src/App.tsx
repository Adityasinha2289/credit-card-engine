import { analytics } from './lib/analytics';
import './index.css';
import { useState, useEffect, Suspense, lazy } from 'react';
import { useUser, RedirectToSignIn, RedirectToSignUp } from '@clerk/clerk-react';
import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';

import { SiteAppLayout } from './components/layout/SiteAppLayout';
import { LoaderHold } from './components/BrandLoader';
import { useDashboardStore, useHydration } from './features/dashboard/store/dashboardStore';
import { useSupabase } from './hooks/useSupabase';

// Finix features (Lazy Loaded)
import { LoginScreen } from './features/dashboard/components/LoginScreen';

// Admin imports
import { AdminGuard } from './components/auth/AdminGuard';
import { AdminLayout } from './components/layout/AdminLayout';

// Demo import
const DemoOnboarding = lazy(() => import('./features/onboarding/demo/DemoOnboarding').then(m => ({ default: m.DemoOnboarding })));
import { DemoAppProvider } from './features/demo/DemoAppProvider';

const HomePage = lazy(() => import('./pages/app/HomePage'));
const DiscoverPage = lazy(() => import('./pages/app/DiscoverPage'));
const AccountPage = lazy(() => import('./pages/app/AccountPage'));
// the website's tools, opened inside the app shell
/** /app/cards/:slug from older links: the card page lives on the website. */
function CardRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/cards/${slug ?? ''}`} replace />;
}

/** /app/tools/<tool> from older links: the calculators live on the website. */
function ToolRedirect() {
  const { tool } = useParams();
  return <Navigate to={`/calculators/${tool ?? 'which-card-to-use'}`} replace />;
}
const WalletPage = lazy(() => import('./pages/app/WalletPage'));
const TaqdeerPage = lazy(() => import('./pages/app/TaqdeerPage'));

// Marketplace
const MarketplaceHome = lazy(() => import('./pages/marketplace/MarketplaceHome'));
const CategoryPage = lazy(() => import('./pages/marketplace/CategoryPage'));
const SubcategoryPage = lazy(() => import('./pages/marketplace/SubcategoryPage'));
const PlanHubPage = lazy(() => import('./pages/app/PlanHubPage'));
const TripPlannerPage = lazy(() => import('./pages/app/TripPlannerPage'));
const DatePlannerPage = lazy(() => import('./pages/app/plan/DatePlannerPage'));
const MoviePlannerPage = lazy(() => import('./pages/app/plan/MoviePlannerPage'));
const WeekendPlannerPage = lazy(() => import('./pages/app/plan/WeekendPlannerPage'));
const FoodPlannerPage = lazy(() => import('./pages/app/plan/FoodPlannerPage'));
const OccasionPlannerPage = lazy(() => import('./pages/app/plan/OccasionPlannerPage'));

// Money Imports
const MoneyManagerPage = lazy(() => import('./pages/app/money/MoneyManagerPage'));

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

  const isProfileDemo = window.location.search.includes('demo=profile') || window.location.search.includes('demo=true');

  // Sync Supabase Client instance to store for actions
  useEffect(() => {
    if (supabase && !isProfileDemo) {
      setSupabaseClient(supabase as any);
    }
  }, [supabase, setSupabaseClient, isProfileDemo]);

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

  // wait for Clerk on every key type: a test key used to skip this and briefly look signed out,
  // which bounced deep links (/app/wallet) to sign-up and then to /app
  const usesDemoData = import.meta.env.VITE_USE_DEMO_DATA === 'true';
  
  if (!isHydrated || (!isLoaded && !usesDemoData && !isProfileDemo) || isHydratingFromSupabase) {
    // Exception for demo mode which requires no hydration or loading
    if (!window.location.search.includes('demo=onboarding') && !isProfileDemo) {
      return (
        <LoaderHold />
      );
    }
  }

  // 0. Intercept Demo Onboarding
  if (window.location.search.includes('demo=onboarding')) {
    return (
      <Suspense fallback={<LoaderHold />}>
        <DemoOnboarding />
      </Suspense>
    );
  }

  // 1. If not signed in AND not using the demo, show LoginScreen (Clerk Auth View)
  const isDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true';
  if (!isSignedIn && !isDemo && !isProfileDemo) {
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

  if (!isProfileDemo && isSignedIn && (!profile || (!profile.onboardingCompleted && !isCompletedInClerk))) {
    return (
      <Routes>
        <Route path="*" element={<LoginScreen defaultMode="signup" />} />
      </Routes>
    );
  }

  const appRoutes = (
    <Routes>
      {/* Customer App Routes */}
      <Route element={
        // signed-in pages wear the website's header and footer
        <SiteAppLayout>
          <Outlet />
        </SiteAppLayout>
      }>
        {/* My RenoCred: overview, wallet, money, picks and account. Tools and cards are website pages. */}
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/money" element={<MoneyManagerPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/account" element={<AccountPage />} />

        <Route path="/taqdeer" element={<TaqdeerPage />} />

        {/* old addresses */}
        <Route path="/credit/*" element={<Navigate to="/app/discover" replace />} />
        <Route path="/cards" element={<Navigate to="/cards" replace />} />
        <Route path="/cards/:slug" element={<CardRedirect />} />
        <Route path="/tools" element={<Navigate to="/calculators/which-card-to-use" replace />} />
        <Route path="/tools/:tool" element={<ToolRedirect />} />
        <Route path="/money/subscriptions" element={<Navigate to="/app/money?tab=subscriptions" replace />} />
        <Route path="/money/transactions" element={<Navigate to="/app/money?tab=activity" replace />} />
        <Route path="/money/coach" element={<Navigate to="/app" replace />} />
        <Route path="/profile" element={<Navigate to="/app/account" replace />} />
        <Route path="/settings" element={<Navigate to="/app/account" replace />} />
        <Route path="/insights" element={<Navigate to="/app" replace />} />
        <Route path="/explore" element={<Navigate to="/app/discover" replace />} />

        {/* Plan Routes */}
        <Route path="/plan" element={<PlanHubPage />} />
        <Route path="/plan/trip" element={<TripPlannerPage />} />
        <Route path="/plan/date" element={<DatePlannerPage />} />
        <Route path="/plan/movie" element={<MoviePlannerPage />} />
        <Route path="/plan/weekend" element={<WeekendPlannerPage />} />
        <Route path="/plan/food" element={<FoodPlannerPage />} />
        <Route path="/plan/occasion" element={<OccasionPlannerPage />} />
        
        {/* Money Routes */}
        
        
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

  if (isProfileDemo) {
    return (
      <DemoAppProvider>
        {appRoutes}
      </DemoAppProvider>
    );
  }

  return appRoutes;
}
