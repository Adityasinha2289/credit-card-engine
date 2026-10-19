import './lib/env' // 🚨 VALIDATE ENV VARS FIRST 🚨
import { StrictMode, useLayoutEffect, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './public-platform/layouts/PublicLayout';
import { HomePage } from './public-platform/pages/HomePage';
import { NotFoundPage } from './public-platform/pages/NotFoundPage';

import { ErrorBoundary } from './components/ErrorBoundary'
import { LoaderHold } from './components/BrandLoader'
import { holdLoaderNow, releaseLoader } from './lib/bootLoader'
import { useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ScrollToTop } from './components/ScrollToTop'


// Lazy loaded boundaries
// Only the landing page ships in the entry chunk; every other public page
// (and its data / chart dependencies) loads on navigation.
const AboutPage = lazy(() => import('./public-platform/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./public-platform/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const MethodologyPage = lazy(() => import('./public-platform/pages/MethodologyPage').then((m) => ({ default: m.MethodologyPage })));
const EditorialPolicyPage = lazy(() => import('./public-platform/pages/EditorialPolicyPage').then((m) => ({ default: m.EditorialPolicyPage })));
const AffiliateDisclosurePage = lazy(() => import('./public-platform/pages/AffiliateDisclosurePage').then((m) => ({ default: m.AffiliateDisclosurePage })));
const PrivacyPage = lazy(() => import('./public-platform/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./public-platform/pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const BusinessPartnerPage = lazy(() => import('./public-platform/pages/BusinessPartnerPage').then((m) => ({ default: m.BusinessPartnerPage })));
const DisclaimerPage = lazy(() => import('./public-platform/pages/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage })));
const CardsDirectoryPage = lazy(() => import('./public-platform/pages/CardsDirectoryPage').then((m) => ({ default: m.CardsDirectoryPage })));
const CardDetailPage = lazy(() => import('./public-platform/pages/CardDetailPage').then((m) => ({ default: m.CardDetailPage })));
const RewardCalculatorPage = lazy(() => import('./public-platform/pages/calculators/RewardCalculatorPage').then((m) => ({ default: m.RewardCalculatorPage })));
const CreditUtilizationPage = lazy(() => import('./public-platform/pages/calculators/CreditUtilizationPage').then((m) => ({ default: m.CreditUtilizationPage })));
const WhichCardPage = lazy(() => import('./public-platform/pages/calculators/WhichCardPage').then((m) => ({ default: m.WhichCardPage })));
const AuthenticatedAppWrapper = lazy(() => import('./components/AuthenticatedAppWrapper'));
const CompareRouter = lazy(() => import('./public-platform/pages/CompareRouter'));

// Defer Analytics and Sentry Initialization
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

function DeferredAnalytics() {
  useEffect(() => {
    const initAnalytics = async () => {
      // 1. Initialize Posthog
      if (POSTHOG_KEY) {
        try {
          const posthog = (await import('posthog-js')).default;
          posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
          });
        } catch (err) {
          console.warn('Failed to initialize PostHog', err);
        }
      }
      // 2. Initialize Sentry
      import('./lib/sentry').catch(console.warn);
    };

    if (document.readyState === 'complete') {
      setTimeout(initAnalytics, 2000);
    } else {
      window.addEventListener('load', () => setTimeout(initAnalytics, 2000));
    }
  }, []);

  return null;
}

/** Signed-in pages hold the loading screen; public pages a plain dark fill (they load in a blink). */
function RouteFallback() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/app')) return <LoaderHold now />;
  return <div className="min-h-[100dvh] bg-rc-night" />;
}

// A direct visit to a signed-in page: show the loading screen from the first frame,
// and hand it over to whatever is loading once React has rendered.
const bootHeld = window.location.pathname.startsWith('/app');
if (bootHeld) holdLoaderNow();

// once only: StrictMode runs effects twice in development, and a second release
// would cancel the hold of whatever is still loading (the screen would blink off)
let bootReleased = false;
function BootRelease() {
  useLayoutEffect(() => {
    if (bootHeld && !bootReleased) {
      bootReleased = true;
      releaseLoader();
    }
  }, []);
  return null;
}

const appContent = (
  <BrowserRouter>
    <ScrollToTop />
    <DeferredAnalytics />
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Private App Route */}
        <Route path="/app/*" element={<AuthenticatedAppWrapper />} />

        {/* Marketplace Routes (Redirect to internal App) */}
        <Route path="/marketplace" element={<Navigate to="/app/marketplace" replace />} />
        <Route path="/marketplace/:categorySlug" element={<Navigate to="/app/marketplace" replace />} />

        {/* Public Platform Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/cards" element={<PublicLayout><CardsDirectoryPage /></PublicLayout>} />
        <Route path="/cards/:slug" element={<PublicLayout><CardDetailPage /></PublicLayout>} />
        
        {/* SEO & Search-Intent Layer: Category Hubs & Comparisons */}
        <Route path="/compare/:categoryOrPairSlug" element={<CompareRouter />} />
        
        {/* Utility Calculators */}
        <Route path="/calculators/credit-card-reward-calculator" element={<PublicLayout><RewardCalculatorPage /></PublicLayout>} />
        {/* fee break-even is part of the rewards and fees calculator now */}
        <Route path="/calculators/annual-fee-break-even" element={<Navigate to="/calculators/credit-card-reward-calculator" replace />} />
        <Route path="/tools" element={<Navigate to="/calculators/which-card-to-use" replace />} />
        <Route path="/calculators/credit-utilization" element={<PublicLayout><CreditUtilizationPage /></PublicLayout>} />
        <Route path="/calculators/which-card-to-use" element={<PublicLayout><WhichCardPage /></PublicLayout>} />

        <Route path="/business" element={<PublicLayout><BusinessPartnerPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/methodology" element={<PublicLayout><MethodologyPage /></PublicLayout>} />
        <Route path="/editorial-policy" element={<PublicLayout><EditorialPolicyPage /></PublicLayout>} />
        <Route path="/affiliate-disclosure" element={<PublicLayout><AffiliateDisclosurePage /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
        <Route path="/disclaimer" element={<PublicLayout><DisclaimerPage /></PublicLayout>} />
        
        {/* 404 Fallback */}
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
    </Suspense>
    <BootRelease />
    <Toaster theme="dark" position="top-center" />
  </BrowserRouter>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {appContent}
    </ErrorBoundary>
  </StrictMode>,
)
