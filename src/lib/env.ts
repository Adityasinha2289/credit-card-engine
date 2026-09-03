/**
 * Environment variable checker.
 * Logs warnings in console for missing variables without crashing or blocking the UI.
 */
export function validateEnv() {
  const varsToCheck = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_AI_API_URL',
    'VITE_SENTRY_DSN',
    'VITE_POSTHOG_KEY',
  ];

  const missingVars = varsToCheck.filter(
    (envVar) => !import.meta.env[envVar]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Missing Environment Variables:\n` +
      missingVars.map((v) => `  - ${v}`).join('\n') +
      `\nRelated features will run with fallback settings.`
    );
  }
}

// Run immediately upon import
validateEnv();
