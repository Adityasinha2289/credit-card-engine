import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    
    // Performance Monitoring
    // Keeping dev noise minimal, but getting full tracing in production
    tracesSampleRate: import.meta.env.DEV ? 0 : 1.0,

    // Unhandled promise rejections are automatically captured by @sentry/browser's global handlers integration, which is enabled by default.
  });
}
