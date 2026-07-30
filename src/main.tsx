import './lib/env' // 🚨 VALIDATE ENV VARS FIRST 🚨
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './public-platform/layouts/PublicLayout';
import { HomePage } from './public-platform/pages/HomePage';
import { AboutPage } from './public-platform/pages/AboutPage';
import { ContactPage } from './public-platform/pages/ContactPage';
import { MethodologyPage } from './public-platform/pages/MethodologyPage';
import { EditorialPolicyPage } from './public-platform/pages/EditorialPolicyPage';
import { AffiliateDisclosurePage } from './public-platform/pages/AffiliateDisclosurePage';
import { PrivacyPage } from './public-platform/pages/PrivacyPage';
import { TermsPage } from './public-platform/pages/TermsPage';
import { DisclaimerPage } from './public-platform/pages/DisclaimerPage';
import { NotFoundPage } from './public-platform/pages/NotFoundPage';
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

import './lib/sentry';
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'sonner'
import { AuthAnalytics } from './components/AuthAnalytics'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'mock_key'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'
if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
  });
}

const appContent = (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#5da08c',
          colorText: 'white',
          colorBackground: 'transparent',
          colorInputBackground: 'rgba(255, 255, 255, 0.03)',
          colorInputText: 'white',
          borderRadius: '0.75rem',
          fontFamily: 'inherit',
        },
        elements: {
          rootBox:"w-full flex justify-center",
          cardBox:"w-full shadow-none border-none",
          card:"bg-transparent shadow-none border-none w-full p-0 sm:p-0",
          headerTitle:"font-display font-bold text-2xl text-text-primary tracking-tight",
          headerSubtitle:"text-text-secondary",
          socialButtonsBlockButton:"bg-surface-primary/50 border border-border-subtle !shadow-none hover:bg-surface-secondary text-white !rounded-xl py-3 transition-colors",
          socialButtonsBlockButtonText:"text-sm font-semibold",
          dividerLine:"bg-white/[0.04]",
          dividerText:"text-text-muted text-xs uppercase tracking-widest font-bold",
          formFieldLabel:"text-xs font-bold text-text-secondary",
          formFieldInput:"bg-surface-secondary border border-border-subtle !shadow-none !outline-none text-text-primary !rounded-xl px-4 py-3 focus:border-brand-emerald/50 focus:ring-1 focus:ring-brand-emerald-glow transition-all text-sm",
          formButtonPrimary:"bg-brand-emerald hover:bg-brand-600 text-white font-semibold text-sm py-3 !rounded-xl !border-none !shadow-none hover:!shadow-[0_0_20px_rgba(4,59,39,0.3)] transition-all active:scale-[0.98]",
          footer:"bg-transparent border-none",
          footerAction:"hidden",
          footerActionText:"hidden",
          footerActionLink:"hidden",
          identityPreviewText:"text-text-primary",
          identityPreviewEditButtonIcon:"text-brand-emerald hover:text-brand-600",
        }
      }}
    >
      <AuthAnalytics />
      <BrowserRouter>
        <Routes>
          {/* Private App Route */}
          <Route path="/app/*" element={<App />} />
          
          {/* Public Platform Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
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
      </BrowserRouter>
      <Toaster theme="dark" position="top-center" />
    </ClerkProvider>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {POSTHOG_KEY ? (
        <PostHogProvider client={posthog}>
          {appContent}
        </PostHogProvider>
      ) : (
        appContent
      )}
    </ErrorBoundary>
  </StrictMode>,
)
