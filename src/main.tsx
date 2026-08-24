import './lib/env' // 🚨 VALIDATE ENV VARS FIRST 🚨
import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './public-platform/layouts/PublicLayout';
import { HomePage } from './public-platform/pages/HomePage';
import { AboutPage } from './public-platform/pages/AboutPage';
import { ContactPage } from './public-platform/pages/ContactPage';
import { MethodologyPage } from './public-platform/pages/MethodologyPage';
import { EditorialPolicyPage } from './public-platform/pages/EditorialPolicyPage';
import { AffiliateDisclosurePage } from './public-platform/pages/AffiliateDisclosurePage';
import { PrivacyPage } from './public-platform/pages/PrivacyPage';
import { TermsPage } from './public-platform/pages/TermsPage';
import { BusinessPartnerPage } from './public-platform/pages/BusinessPartnerPage';
import { DisclaimerPage } from './public-platform/pages/DisclaimerPage';
import { NotFoundPage } from './public-platform/pages/NotFoundPage';
import { CardsDirectoryPage } from './public-platform/pages/CardsDirectoryPage';
import { CardDetailPage } from './public-platform/pages/CardDetailPage';

import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'sonner'
import { ScrollToTop } from './components/ScrollToTop'

import { RewardCalculatorPage } from './public-platform/pages/calculators/RewardCalculatorPage';
import { BreakEvenCalculatorPage } from './public-platform/pages/calculators/BreakEvenCalculatorPage';
import { CreditUtilizationPage } from './public-platform/pages/calculators/CreditUtilizationPage';

// Lazy loaded boundaries
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

const appContent = (
  <BrowserRouter>
    <ScrollToTop />
    <DeferredAnalytics />
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#F9FAFB]" />}>
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
        <Route path="/calculators/annual-fee-break-even" element={<PublicLayout><BreakEvenCalculatorPage /></PublicLayout>} />
        <Route path="/calculators/credit-utilization" element={<PublicLayout><CreditUtilizationPage /></PublicLayout>} />

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
